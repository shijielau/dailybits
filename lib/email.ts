import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { TopicNews } from "./fetch-news";

const FROM = process.env.GMAIL_FROM ?? "shijielau@gmail.com";

function getTransporter() {
  if (!process.env.GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_APP_PASSWORD is not set in environment variables");
  }
  const opts = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: FROM,
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ""),
    },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  } as SMTPTransport.Options;
  return nodemailer.createTransport(opts);
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
          : t.items.length === 0
          ? `<p style="color:#9ca3af;font-size:13px;">No recent news found for this topic.</p>`
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
    <h1 style="margin:0;color:#4338ca;font-size:26px;">📰 LazyBits</h1>
    <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">${today}</p>
  </div>
  ${sections}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
    <p style="margin:0;color:#9ca3af;font-size:11px;">
      Powered by Google News RSS · LazyBits
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

  await getTransporter().sendMail({
    from: `LazyBits <${FROM}>`,
    to,
    subject: `LazyBits — ${today}`,
    html: toHtml(news),
  });
}
