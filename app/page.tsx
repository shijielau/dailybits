"use client";

import { useState } from "react";

interface Subscription {
  id: string;
  email: string;
  topics: string[];
  schedule_time: string;
  active: boolean;
}

type PageState = "lookup" | "create" | "manage" | "edit";

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("lookup");
  const [emailInput, setEmailInput] = useState("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [scheduleTime, setScheduleTime] = useState("08:00");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; ok: boolean } | null>(null);

  function showBanner(msg: string, ok: boolean) {
    setBanner({ msg, ok });
    setTimeout(() => setBanner(null), 4000);
  }

  async function handleLookup() {
    if (!emailInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subscription?email=${encodeURIComponent(emailInput)}`);
      const data = await res.json() as { exists: boolean; subscription?: Subscription };
      if (data.exists && data.subscription) {
        setSubscription(data.subscription);
        setTopics(data.subscription.topics);
        setScheduleTime(data.subscription.schedule_time);
        setPageState("manage");
      } else {
        setTopics([]);
        setScheduleTime("08:00");
        setPageState("create");
      }
    } catch {
      showBanner("Something went wrong. Please try again.", false);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (topics.length === 0) {
      showBanner("Add at least one topic.", false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, topics, scheduleTime }),
      });
      const data = await res.json() as { subscription: Subscription };
      setSubscription(data.subscription);
      setPageState("manage");
      showBanner(
        pageState === "create"
          ? "Subscription created! You'll receive your first digest at " + scheduleTime
          : "Subscription updated!",
        true
      );
    } catch {
      showBanner("Something went wrong. Please try again.", false);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setLoading(true);
    try {
      await fetch(`/api/subscription?email=${encodeURIComponent(emailInput)}`, {
        method: "DELETE",
      });
      setSubscription(null);
      setPageState("lookup");
      setEmailInput("");
      showBanner("Subscription cancelled.", true);
    } catch {
      showBanner("Something went wrong. Please try again.", false);
    } finally {
      setLoading(false);
    }
  }

  function addTopic() {
    const t = newTopic.trim();
    if (!t || topics.includes(t)) return;
    setTopics([...topics, t]);
    setNewTopic("");
  }

  function removeTopic(i: number) {
    setTopics(topics.filter((_, idx) => idx !== i));
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-indigo-600">LazyBits</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your daily news digest</p>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-10 space-y-6">
        {/* Banner */}
        {banner && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
            banner.ok
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {banner.ok ? "✓ " : "✗ "}{banner.msg}
          </div>
        )}

        {/* LOOKUP */}
        {pageState === "lookup" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Manage your digest</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email to view or create your subscription.
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={handleLookup}
                disabled={loading || !emailInput.trim()}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium
                           rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                {loading ? "Looking up…" : "Continue →"}
              </button>
            </div>
          </div>
        )}

        {/* CREATE */}
        {pageState === "create" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Create subscription</h2>
                <p className="text-sm text-gray-500 mt-0.5">{emailInput}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTopic()}
                    placeholder="e.g. AI, crypto, climate…"
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
                <ul className="mt-2 space-y-1.5">
                  {topics.map((t, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">{t}</span>
                      <button onClick={() => removeTopic(i)} className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily send time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPageState("lookup")}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm
                           font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={loading || topics.length === 0}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium
                           rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                {loading ? "Saving…" : "Subscribe"}
              </button>
            </div>
          </div>
        )}

        {/* MANAGE */}
        {pageState === "manage" && subscription && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your subscription</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{subscription.email}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                  Active
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {subscription.topics.map((t, i) => (
                    <span key={i} className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Daily send time</p>
                <p className="text-sm text-gray-700">
                  {new Date(`2000-01-01T${subscription.schedule_time}`).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-2.5 border border-red-200 text-red-600 text-sm
                           font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel subscription
              </button>
              <button
                onClick={() => setPageState("edit")}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium
                           rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Edit
              </button>
            </div>

            <button
              onClick={() => { setPageState("lookup"); setEmailInput(""); }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Use a different email
            </button>
          </div>
        )}

        {/* EDIT */}
        {pageState === "edit" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit subscription</h2>
                <p className="text-sm text-gray-500 mt-0.5">{emailInput}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topics</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTopic()}
                    placeholder="Add a topic…"
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
                <ul className="mt-2 space-y-1.5">
                  {topics.map((t, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">{t}</span>
                      <button onClick={() => removeTopic(i)} className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily send time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPageState("manage")}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm
                           font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={loading || topics.length === 0}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium
                           rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                {loading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
