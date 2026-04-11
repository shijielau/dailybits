import { createServer } from "http";
import { parse } from "url";
import next from "next";
import cron from "node-cron";
import { loadConfig } from "./lib/storage";
import { runGenerate } from "./lib/generate";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);
    await handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`\n> DailyBits running at http://${hostname}:${port}`);
    console.log("> Cron scheduler active — checking every minute\n");
  });

  // Check every minute whether it's time to send the daily digest
  cron.schedule("* * * * *", async () => {
    const config = loadConfig();
    if (!config.email || config.topics.length === 0) return;

    const [scheduledH, scheduledM] = config.scheduleTime
      .split(":")
      .map(Number);
    const now = new Date();

    if (now.getHours() === scheduledH && now.getMinutes() === scheduledM) {
      console.log(
        `[cron] ${now.toLocaleTimeString()} — running scheduled digest for ${config.topics.length} topic(s)`
      );
      try {
        const result = await runGenerate();
        console.log(
          `[cron] Done. Email sent: ${result.emailSent ? result.emailTo : "no"}`
        );
      } catch (err) {
        console.error("[cron] Error:", err instanceof Error ? err.message : err);
      }
    }
  });
});
