import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser();
const GOOGLE_NEWS_TOP = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";

// Cache for 1 hour so we don't hammer Google News
let cache: { topics: string[]; at: number } | null = null;
const TTL_MS = 60 * 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < TTL_MS) {
      return NextResponse.json({ topics: cache.topics });
    }
    const feed = await parser.parseURL(GOOGLE_NEWS_TOP);
    const topics = feed.items
      .slice(0, 12)
      .map((item) => {
        // Strip the " - Source" suffix Google News appends
        const title = item.title ?? "";
        return title.split(" - ")[0].trim();
      })
      .filter((t) => t.length > 0 && t.length < 60);

    cache = { topics, at: Date.now() };
    return NextResponse.json({ topics });
  } catch {
    return NextResponse.json({ topics: [] });
  }
}
