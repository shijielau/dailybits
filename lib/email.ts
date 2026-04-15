import type { TopicNews } from "./fetch-news";

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? "shijielau@gmail.com";
const FROM_NAME = "LazyBits";

const SITE_URL = process.env.SITE_URL ?? "https://lazybits-production.up.railway.app";

function toHtml(news: TopicNews[], recipientEmail: string): string {
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
    <a href="${SITE_URL}" style="text-decoration:none;">
      <h1 style="margin:0;color:#4338ca;font-size:26px;">📰 LazyBits</h1>
    </a>
    <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">${today}</p>
  </div>
  ${sections}
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 8px;color:#9ca3af;font-size:11px;">
      Powered by Google News RSS · LazyBits
    </p>
    <a href="${SITE_URL}/?email=${encodeURIComponent(recipientEmail)}" style="color:#4338ca;font-size:12px;font-weight:600;">
      ✏️ Update your topics or cancel your subscription →
    </a>
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

  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not set in environment variables");
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { name: FROM_NAME, email: FROM_EMAIL },
      personalizations: [{ to: [{ email: to }] }],
      subject: `LazyBits — ${today}`,
      content: [{ type: "text/html", value: toHtml(news, to) }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SendGrid error: ${err}`);
  }
}
