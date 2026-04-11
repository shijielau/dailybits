import { Resend } from "resend";
import type { TopicNews } from "./fetch-news";

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set in .env.local");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

function toHtml(news: TopicNews[]): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = news
    .map((t) => {
      const items =
        t.error
          ? `<p style="color:#9ca3af;font-size:13px;">Could not fetch headlines: ${t.error}</p>`
          : t.items
              .map(
                (item) => `
  <div style="margin-bottom:14px;">
    <a href="${item.link}" style="color:#4338ca;font-weight:600;font-size:14px;text-decoration:none;">
      ${item.headline}
    </a>
    <div style="color:#6b7280;font-size:12px;margin-top:2px;">
      ${item.source}${item.pubDate ? " · " + new Date(item.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
    </div>
    ${item.snippet ? `<p style="color:#374151;font-size:13px;margin:4px 0 0;line-height:1.5;">${item.snippet}</p>` : ""}
  </div>`
              )
              .join("");

      return `
  <h2 style="color:#4338ca;font-size:17px;margin:28px 0 12px;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">
    ${t.topic}
  </h2>
  ${items}`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#fff;">
  <div style="border-bottom:3px solid #4338ca;padding-bottom:16px;margin-bottom:8px;">
    <h1 style="margin:0;color:#4338ca;font-size:26px;">📰 DailyBits</h1>
    <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">${today}</p>
  </div>
  ${sections}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:11px;">
      Powered by Google News RSS · DailyBits
    </p>
  </div>
</body>
</html>`;
}

export async function sendSummaryEmail(
  to: string,
  news: TopicNews[],
  _topics: string[]
): Promise<void> {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const { error } = await getResend().emails.send({
    from: `DailyBits <${FROM}>`,
    to,
    subject: `DailyBits — ${today}`,
    html: toHtml(news),
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}
