import { createServer } from "http";
import { parse } from "url";
import next from "next";
import cron from "node-cron";
import { initDb, getActiveSubscriptions } from "./lib/db";
import { runGenerateForSubscription } from "./lib/generate";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/** Returns "HH:MM" in the given IANA timezone */
function localTimeIn(tz: string, now: Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
    const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
    return `${hour}:${minute}`;
  } catch {
    // Fallback to UTC if timezone string is invalid
    const h = String(now.getUTCHours()).padStart(2, "0");
    const m = String(now.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
}

app.prepare().then(async () => {
  // Initialise database tables on startup
  try {
    await initDb();
    console.log("> Database ready");
  } catch (err) {
    console.error("> Database init failed:", err);
  }

  createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`\n> LazyBits running at http://${hostname}:${port}`);
    console.log("> Cron scheduler active — checking every minute\n");
  });

  // Every minute: find subscribers whose local time matches their schedule_time
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    let subscriptions;
    try {
      subscriptions = await getActiveSubscriptions();
    } catch {
      return; // DB not ready yet
    }

    const due = subscriptions.filter((s) => {
      const tz = s.timezone || "UTC";
      return localTimeIn(tz, now) === s.schedule_time;
    });

    if (due.length === 0) return;

    console.log(`[cron] Sending digest to ${due.length} subscriber(s)`);

    for (const sub of due) {
      const result = await runGenerateForSubscription(sub);
      if (result.emailSent) {
        console.log(`[cron] ✓ Sent to ${result.email} (${sub.timezone})`);
      } else {
        console.log(`[cron] ✗ Failed for ${result.email}: ${result.error}`);
      }
    }
  });
});
