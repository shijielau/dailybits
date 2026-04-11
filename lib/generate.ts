import { fetchTopicNews } from "./fetch-news";
import { sendSummaryEmail } from "./email";
import type { Subscription } from "./db";

export interface GenerateResult {
  email: string;
  emailSent: boolean;
  error?: string;
}

export async function runGenerateForSubscription(
  sub: Subscription
): Promise<GenerateResult> {
  try {
    const news = await fetchTopicNews(sub.topics);
    await sendSummaryEmail(sub.email, news, sub.topics);
    return { email: sub.email, emailSent: true };
  } catch (err) {
    return {
      email: sub.email,
      emailSent: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
