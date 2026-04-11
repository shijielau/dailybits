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

  // Every minute: find all active subscribers whose send time matches now
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    let subscriptions;
    try {
      subscriptions = await getActiveSubscriptions();
    } catch {
      return; // DB not ready yet
    }

    const due = subscriptions.filter((s) => s.schedule_time === currentTime);
    if (due.length === 0) return;

    console.log(`[cron] ${currentTime} — sending digest to ${due.length} subscriber(s)`);

    for (const sub of due) {
      const result = await runGenerateForSubscription(sub);
      if (result.emailSent) {
        console.log(`[cron] ✓ Sent to ${result.email}`);
      } else {
        console.log(`[cron] ✗ Failed for ${result.email}: ${result.error}`);
      }
    }
  });
});
