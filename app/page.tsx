"use client";

import { useEffect, useState } from "react";

interface Config {
  topics: string[];
  email: string;
  scheduleTime: string;
}

interface Summary {
  id: string;
  generatedAt: string;
  content: string;
  emailSent: boolean;
  emailTo: string;
}

interface NewsItem {
  headline: string;
  source: string;
  link: string;
  pubDate: string;
  snippet: string;
}

interface TopicNews {
  topic: string;
  items: NewsItem[];
  error?: string;
}

function SummaryContent({ content }: { content: string }) {
  let news: TopicNews[] | null = null;
  try {
    news = JSON.parse(content) as TopicNews[];
  } catch {
    // Legacy plain-text format
  }

  if (!news) {
    return (
      <p className="text-sm text-gray-500 italic">
        (Legacy summary — plain text not renderable)
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {news.map((t, ti) => (
        <div key={ti}>
          <h3 className="font-semibold text-indigo-700 text-base mb-3 pb-1 border-b border-gray-100">
            {t.topic}
          </h3>
          {t.error ? (
            <p className="text-sm text-red-500">Could not fetch: {t.error}</p>
          ) : t.items.length === 0 ? (
            <p className="text-sm text-gray-400">No headlines found.</p>
          ) : (
            <ul className="space-y-3">
              {t.items.map((item, ii) => (
                <li key={ii}>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {item.headline}
                  </a>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.source}
                    {item.pubDate && (
                      <>
                        {" · "}
                        {new Date(item.pubDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </>
                    )}
                  </div>
                  {item.snippet && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {item.snippet}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [config, setConfig] = useState<Config>({
    topics: [],
    email: "",
    scheduleTime: "08:00",
  });
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; ok: boolean } | null>(
    null
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetch("/api/topics")
      .then((r) => r.json())
      .then(setConfig);
    fetch("/api/summaries")
      .then((r) => r.json())
      .then(setSummaries);
  }, []);

  async function persistConfig(patch: Partial<Config>) {
    const updated = { ...config, ...patch };
    setConfig(updated);
    setSavingConfig(true);
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setSavingConfig(false);
  }

  function addTopic() {
    const trimmed = newTopic.trim();
    if (!trimmed || config.topics.includes(trimmed)) return;
    persistConfig({ topics: [...config.topics, trimmed] });
    setNewTopic("");
  }

  function removeTopic(idx: number) {
    persistConfig({ topics: config.topics.filter((_, i) => i !== idx) });
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setBanner(null);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      const data = (await res.json()) as {
        success: boolean;
        emailSent?: boolean;
        error?: string;
      };
      if (data.success) {
        setBanner({
          msg: data.emailSent
            ? "Summary generated and email sent!"
            : "Summary generated (no email address set).",
          ok: true,
        });
        fetch("/api/summaries")
          .then((r) => r.json())
          .then(setSummaries);
      } else {
        setBanner({ msg: data.error ?? "Unknown error", ok: false });
      }
    } catch {
      setBanner({ msg: "Request failed — is the server running?", ok: false });
    } finally {
      setIsGenerating(false);
    }
  }

  const nextRun = (() => {
    const [h, m] = config.scheduleTime.split(":").map(Number);
    const now = new Date();
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.toLocaleString("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-indigo-600">
              DailyBits
            </span>
            <span className="ml-3 text-sm text-gray-400">
              Next run: {nextRun}
            </span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || config.topics.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg
                       hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors flex items-center gap-2"
          >
            {isGenerating && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isGenerating ? "Generating…" : "Generate & Send Now"}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Banner */}
        {banner && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium ${
              banner.ok
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {banner.ok ? "✓ " : "✗ "}
            {banner.msg}
          </div>
        )}

        {/* Config grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Topics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Topics to Track</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTopic()}
                placeholder="e.g. AI news, crypto, climate…"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={addTopic}
                disabled={!newTopic.trim()}
                className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg
                           hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>

            {config.topics.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                No topics yet — add one above.
              </p>
            ) : (
              <ul className="space-y-2">
                {config.topics.map((topic, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-gray-700">{topic}</span>
                    <button
                      onClick={() => removeTopic(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none ml-2"
                      aria-label={`Remove ${topic}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Settings</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig((c) => ({ ...c, email: e.target.value }))}
                onBlur={() => persistConfig({ email: config.email })}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily send time (local)
              </label>
              <input
                type="time"
                value={config.scheduleTime}
                onChange={(e) => persistConfig({ scheduleTime: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {savingConfig && (
              <p className="text-xs text-gray-400">Saving…</p>
            )}

            <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700 space-y-1">
              <p className="font-medium">Optional: email in .env.local</p>
              <p>RESEND_API_KEY — for sending emails</p>
              <p>RESEND_FROM_EMAIL — sender address</p>
            </div>
          </div>
        </div>

        {/* Summaries */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">
            Recent Summaries
            {summaries.length > 0 && (
              <span className="ml-2 text-xs text-gray-400 font-normal">
                ({summaries.length})
              </span>
            )}
          </h2>

          {summaries.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
              No summaries yet. Configure your topics and hit{" "}
              <span className="font-medium text-gray-500">
                Generate &amp; Send Now
              </span>
              .
            </div>
          ) : (
            <div className="space-y-3">
              {summaries.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpanded(expanded === s.id ? null : s.id)
                    }
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(s.generatedAt).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {s.emailSent && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Sent → {s.emailTo}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs ml-4 shrink-0">
                      {expanded === s.id ? "▲ hide" : "▼ show"}
                    </span>
                  </button>

                  {expanded === s.id && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                      <SummaryContent content={s.content} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
