import { v4 as uuidv4 } from "uuid";
import { fetchTopicNews, type TopicNews } from "./fetch-news";
import { sendSummaryEmail } from "./email";
import { loadConfig, saveSummary } from "./storage";

export interface GenerateResult {
  content: string; // JSON-stringified TopicNews[]
  emailSent: boolean;
  emailTo: string;
}

export async function runGenerate(): Promise<GenerateResult> {
  const config = loadConfig();

  if (config.topics.length === 0) {
    throw new Error("No topics configured. Add at least one topic first.");
  }

  const news: TopicNews[] = await fetchTopicNews(config.topics);
  const content = JSON.stringify(news);

  let emailSent = false;
  const emailTo = config.email;

  if (emailTo) {
    await sendSummaryEmail(emailTo, news, config.topics);
    emailSent = true;
  }

  saveSummary({
    id: uuidv4(),
    generatedAt: new Date().toISOString(),
    content,
    emailSent,
    emailTo,
  });

  return { content, emailSent, emailTo };
}
