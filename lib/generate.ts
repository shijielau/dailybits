import { fetchTopicNews } from "./fetch-news";
import { sendSummaryEmail } from "./email";
import { decryptEmail } from "./crypto";
import type { Subscription } from "./db";

export interface GenerateResult {
  email: string;
  emailSent: boolean;
  error?: string;
}

export async function runGenerateForSubscription(
  sub: Subscription
): Promise<GenerateResult> {
  // Decrypt email if encrypted, fall back to plain email for legacy rows
  let recipient: string;
  try {
    if (sub.email_encrypted) {
      recipient = decryptEmail(sub.email_encrypted);
    } else if (sub.email) {
      recipient = sub.email;
    } else {
      return { email: sub.email_display ?? "unknown", emailSent: false, error: "No email available" };
    }
  } catch (err) {
    return {
      email: sub.email_display ?? "unknown",
      emailSent: false,
      error: `Decryption failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }

  try {
    const news = await fetchTopicNews(sub.topics);
    await sendSummaryEmail(recipient, news, sub.topics);
    return { email: sub.email_display ?? "encrypted", emailSent: true };
  } catch (err) {
    return {
      email: sub.email_display ?? "encrypted",
      emailSent: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
