import Parser from "rss-parser";

export interface NewsItem {
  headline: string;
  source: string;
  link: string;
  pubDate: string;
  snippet: string;
}

export interface TopicNews {
  topic: string;
  items: NewsItem[];
  error?: string;
}

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "DailyBits/1.0 RSS Reader" },
});

/** Google News gives an RSS feed for any search query — no key needed. */
function googleNewsUrl(topic: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`;
}

/** Google News titles look like "Headline text - Source Name" */
function splitTitle(raw: string): { headline: string; source: string } {
  const idx = raw.lastIndexOf(" - ");
  if (idx > 0)
    return { headline: raw.slice(0, idx), source: raw.slice(idx + 3) };
  return { headline: raw, source: "" };
}

export async function fetchTopicNews(topics: string[]): Promise<TopicNews[]> {
  return Promise.all(
    topics.map(async (topic): Promise<TopicNews> => {
      try {
        const feed = await parser.parseURL(googleNewsUrl(topic));
        const items: NewsItem[] = feed.items.slice(0, 6).map((item) => {
          const { headline, source } = splitTitle(item.title ?? "");
          return {
            headline,
            source,
            link: item.link ?? "",
            pubDate: item.pubDate ?? "",
            snippet: item.contentSnippet?.slice(0, 200) ?? "",
          };
        });
        return { topic, items };
      } catch (err) {
        return {
          topic,
          items: [],
          error: err instanceof Error ? err.message : "Fetch failed",
        };
      }
    })
  );
}
