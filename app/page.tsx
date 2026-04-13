"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

// ─── COPY BANKS ───────────────────────────────────────────────────────────────

const TITLES_LOOKUP = [
  "WHO ARE YOU, LAZY?",
  "OI, IDENTIFY YOURSELF!",
  "ENTER THE LAZY ZONE!",
  "AYY WHO'S THERE?",
  "LAZYBITS NEEDS YOUR EMAIL!",
  "SHOW ME WHO YOU ARE!",
  "FIRST THINGS FIRST... YOUR EMAIL!",
  "LET'S GET YOU SET UP, LAZY!",
  "EMAIL OR IT DIDN'T HAPPEN!",
  "WELCOME. NOW GIVE ME YOUR EMAIL.",
  "ACCESS GRANTED... AFTER YOUR EMAIL.",
  "YOU SHALL NOT PASS... WITHOUT EMAIL!",
  "STEP ONE: DON'T BE ANONYMOUS!",
  "HI THERE! EMAIL PLS 🙏",
  "YOUR LAZY JOURNEY STARTS HERE!",
];

const LOOKUP_BUTTONS = [
  "LET'S GO ⚡",
  "HIT ME! 🎯",
  "DO IT! 🔥",
  "FIND ME! 🔍",
  "ENTER THE LAZY ZONE!",
  "I'M READY! 🚀",
  "TAKE ME IN!",
  "LFG!!!",
  "YES, THAT'S ME!",
  "BEAM ME UP! 🛸",
  "OPEN SESAME!",
  "ENGAGE! 🖖",
  "PUNCH IT! 👊",
  "GO GO GO!",
  "I IDENTIFY AS LAZY!",
];

const TITLES_CREATE = [
  "HEY GET YO LAZY ASS HERE!",
  "WAKE UP & SMELL THE NEWS!",
  "YO, WHAT DO YOU EVEN CARE ABOUT?",
  "TELL ME YOUR OBSESSIONS!",
  "NEW HERE? SPILL YOUR INTERESTS!",
  "OOH A FRESH LAZY, HOW CUTE!",
  "STEP RIGHT UP, GET YO BITS!",
  "SPILL THE TEA ON YOUR INTERESTS!",
  "YOU LOOK LIKE SOMEONE WHO LOVES NEWS!",
  "YOUR DAILY DOSE STARTS HERE!",
  "TIME TO GET YOURSELF INFORMED!",
  "LAZY? WE GOT YOU COVERED!",
  "WHAT'S POPPIN IN YOUR WORLD?",
  "DON'T BE SHY, TELL ME EVERYTHING!",
  "GET READY TO BE IN THE KNOW!",
  "LET'S BUILD YOUR LAZY FEED!",
  "FUTURE YOU WILL THANK PRESENT YOU!",
  "ANOTHER LAZY JOINS THE SQUAD!",
  "NO CAP, THIS WILL CHANGE YOUR LIFE!",
  "IT'S GIVING... INFORMED LAZY!",
];

const TITLES_EDIT = [
  "EDIT YOUR LAZY LIST YOU LAZY ASS",
  "CHANGING YOUR MIND AGAIN??",
  "ALRIGHT ALRIGHT, WHAT CHANGED?",
  "BACK FOR MORE TWEAKS, HUH?",
  "YOU'RE NEVER SATISFIED ARE YOU 😤",
  "FINE, LET'S UPDATE YOUR BITS",
  "STILL ALIVE? GOOD. EDIT AWAY.",
  "YOUR PREFERENCES, YOUR RULES I GUESS",
  "OK BOSS, WHAT ARE WE CHANGING?",
  "REFRESH YOUR LAZY FEED!",
  "PLOT TWIST: YOU'RE EDITING!",
  "GLOW UP YOUR SUBSCRIPTION!",
  "MID-SEASON CORRECTIONS, I SEE",
  "CHARACTER DEVELOPMENT INCOMING!",
  "UPDATING THE LAZY PROTOCOL...",
  "ANOTHER SHIFT, HUH?",
  "THE GIRLIES ARE PIVOTING!",
  "OKAY OKAY, NEW PHONE WHO DIS",
  "MAIN CHARACTER ENERGY: EDITING",
  "ERA CHANGE DETECTED 🚨",
];

const TITLES_MANAGE = [
  "YO WELCOME BACK LAZY!",
  "LOOK WHO SHOWED UP!",
  "YOUR LAZY LIST, AS REQUESTED!",
  "AYY IT'S YOU AGAIN!",
  "YOUR COMMAND CENTER IS READY!",
  "ALRIGHT LET'S SEE YOUR STUFF!",
  "YOUR DAILY BITS HQ!",
  "OH HEY STRANGER!",
  "THE LAZY LEGEND RETURNS!",
  "WASSUP, YOUR SETTINGS ARE LIVE!",
  "YOUR BIT CHECK IS READY!",
  "ACTIVE AND LAZY, AS IT SHOULD BE!",
  "YOUR BITS ARE SAFE AND SOUND!",
  "CURRENTLY SERVING: YOUR LAZY ASS",
  "WELCOME BACK TO THE LAZY SIDE!",
  "AH YES, THE CHOSEN ONE RETURNS",
  "YOUR FEED AWAITS, LAZY KING/QUEEN!",
  "BACK IN ACTION, I SEE!",
  "THE LEGEND LOGS BACK IN!",
  "PRESENCE DETECTED. GREETINGS.",
];

const SAVE_BUTTONS = [
  "LFG, SAVE IT!",
  "HECK YEAH, DO IT!",
  "YAS QUEEN, SAVE!",
  "LOCK IT IN!",
  "LETS GOOO 🚀",
  "SHIP IT!",
  "DO THE THING!",
  "MAKE IT HAPPEN!",
  "YOLO, SAVE!",
  "SLAY AND SAVE!",
  "BET, SAVING NOW!",
  "NO CAP, SAVE THIS!",
  "FR FR LOCK IT IN!",
  "IT'S GIVING... SAVED!",
  "MANIFESTING YOUR BITS!",
  "SAVING THIS MASTERPIECE!",
  "COMMIT AND PUSH! 🧑‍💻",
  "YASSS KING/QUEEN!",
  "THIS SLAPS, SAVE IT!",
  "OK BESTIE, SAVING!",
  "BASED. SAVING.",
  "SEND IT! 🔥",
  "GOATED SAVE RIGHT HERE!",
  "THE PROPHECY IS FULFILLED!",
  "MISSION ACCOMPLISHED 🫡",
  "RIZZ LOCKED IN!",
  "W MOVE, SAVING!",
  "ABSOLUTE UNIT OF A SAVE",
  "POG. SAVING.",
  "VERY DEMURE, VERY MINDFUL. SAVING.",
];

const BACK_BUTTONS = [
  "NAH, GO BACK",
  "NOPE, I'M OUT ✌️",
  "ABORT MISSION",
  "EHH MAYBE LATER",
  "NEVER MIND BRO",
  "TAKE ME BACK!",
  "I CHANGED MY MIND",
  "WAIT WAIT WAIT",
  "NOT TODAY SATAN",
  "RETREAT! RETREAT!",
  "LEMME THINK MORE",
  "LOL NO THANKS",
  "BACK TO SAFETY",
  "NOPE NAH NO WAY",
  "I'M SCARED, GO BACK",
  "ACTUALLY WAIT",
  "HOLD UP HOLD UP",
  "MY MOM IS CALLING",
  "PRETEND I WASN'T HERE",
  "NOT FEELING IT RN",
  "CHANGED MY MIND BESTIE",
  "RUN AWAY! 🏃",
  "ERROR 404: MOTIVATION LOST",
  "LET ME COOK A BIT MORE",
  "SKILL ISSUE, GOING BACK",
  "TOUCH GRASS FIRST",
  "COWARDLY RETREATING...",
  "GHOST MODE: ACTIVATED",
  "I NEED AN ADULT",
  "BITS ARE OFF, BACK",
];

const TOPIC_EMOJIS = [
  "💰", "🎮", "🎬", "🤖", "🏀", "🎵", "🌍", "🚀",
  "💡", "🔥", "⚡", "🎯", "🎪", "🦊", "🌟", "💎",
  "🏆", "🎨", "🍕", "🐉", "🦋", "🌈", "🎭", "🤑",
  "🧠", "👾", "🛸", "🪄", "🏄", "🦁",
];

const TOPIC_TAGS = [
  "PRIORITY: HIGH", "FAN ALERT", "DEV MODE", "WATCH LIST", "OBSESSED",
  "STAYING INFORMED", "NERD ALERT", "HYPE TRAIN", "DEEP DIVE", "ON MY RADAR",
  "MAIN CHARACTER", "CORE INTEREST", "CANNOT MISS", "BIG BRAIN ENERGY",
  "CERTIFIED BANGER", "ABSOLUTELY ESSENTIAL", "LIVING FOR THIS",
  "DAILY CHECK-IN", "HYPERFIXATION", "NO SKIP", "LOCKED IN",
];

const TOPIC_ICON_BG = [
  "bg-pink-200", "bg-blue-200", "bg-green-200", "bg-yellow-200",
  "bg-purple-200", "bg-orange-200", "bg-teal-200", "bg-red-200",
  "bg-indigo-200", "bg-emerald-200", "bg-fuchsia-200", "bg-amber-200",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return Math.abs(h);
}

function pickBy<T>(arr: T[], seed: string): T {
  return arr[hashStr(seed) % arr.length];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── TIME HELPERS ──────────────────────────────────────────────────────────────

function parseTo12h(time24: string): { hour: number; minute: number; isPm: boolean } {
  const [hStr, mStr] = (time24 || "08:00").split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const isPm = h >= 12;
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { hour: h, minute: m, isPm };
}

function to24h(hour: number, minute: number, isPm: boolean): string {
  let h = hour;
  if (isPm && h !== 12) h += 12;
  if (!isPm && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// ─── TIMEZONES ────────────────────────────────────────────────────────────────

const COMMON_TIMEZONES = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Atlantic/Azores",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Helsinki",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Australia/Perth",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Subscription {
  id: string;
  email_display: string | null;
  topics: string[];
  schedule_time: string;
  timezone: string;
  active: boolean;
}

type PageState = "lookup" | "create" | "manage";

// ─── SLOTH ART ────────────────────────────────────────────────────────────────

function SlothArt() {
  return (
    <Image src="/sloth.png" alt="Cool sloth mascot" width={300} height={300} className="w-full h-auto" />
  );
}

// ─── TIME UNIT ────────────────────────────────────────────────────────────────

function TimeUnit({
  val,
  onUp,
  onDown,
  disabled,
}: {
  val: string;
  onUp: () => void;
  onDown: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onUp}
        disabled={disabled}
        className="text-gray-400 hover:text-gray-700 disabled:opacity-0 font-bold py-1 text-sm leading-none select-none"
      >
        ▲
      </button>
      <span className="text-5xl font-black text-gray-900 w-14 text-center tabular-nums leading-none my-1">
        {val}
      </span>
      <button
        onClick={onDown}
        disabled={disabled}
        className="text-gray-400 hover:text-gray-700 disabled:opacity-0 font-bold py-1 text-sm leading-none select-none"
      >
        ▼
      </button>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("lookup");
  const [emailInput, setEmailInput] = useState("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; ok: boolean } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [timeState, setTimeState] = useState(() => parseTo12h("08:00"));
  const [timezone, setTimezone] = useState(detectTimezone);
  const [editingTz, setEditingTz] = useState(false);

  const scheduleTime = to24h(timeState.hour, timeState.minute, timeState.isPm);

  // Stable random copy picked once per page load
  const copy = useMemo(
    () => ({
      lookup: pick(TITLES_LOOKUP),
      go: pick(LOOKUP_BUTTONS),
      create: pick(TITLES_CREATE),
      edit: pick(TITLES_EDIT),
      manage: pick(TITLES_MANAGE),
      save: pick(SAVE_BUTTONS),
      back: pick(BACK_BUTTONS),
    }),
    []
  );

  // On mount: auto-login returning users from cached email
  useEffect(() => {
    const cached = localStorage.getItem("lazybits_email");
    if (cached) {
      setEmailInput(cached);
      setLoading(true);
      fetch(`/api/subscription?email=${encodeURIComponent(cached)}`)
        .then((r) => r.json())
        .then((data: { exists: boolean; subscription?: Subscription }) => {
          if (data.exists && data.subscription) {
            setSubscription(data.subscription);
            setTopics(data.subscription.topics);
            setTimeState(parseTo12h(data.subscription.schedule_time));
            setTimezone(data.subscription.timezone || detectTimezone());
            setIsEditing(false);
            setPageState("manage");
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  // Fetch trending topics on mount
  useEffect(() => {
    fetch("/api/trending")
      .then((r) => r.json())
      .then((d) => setSuggestions((d.topics || []).slice(0, 8)))
      .catch(() => {});
  }, []);

  function showBanner(msg: string, ok: boolean) {
    setBanner({ msg, ok });
    setTimeout(() => setBanner(null), 4000);
  }

  async function handleLookup() {
    if (!emailInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/subscription?email=${encodeURIComponent(emailInput)}`
      );
      const data = (await res.json()) as {
        exists: boolean;
        subscription?: Subscription;
      };
      if (data.exists && data.subscription) {
        localStorage.setItem("lazybits_email", emailInput.trim());
        setSubscription(data.subscription);
        setTopics(data.subscription.topics);
        setTimeState(parseTo12h(data.subscription.schedule_time));
        setTimezone(data.subscription.timezone || detectTimezone());
        setIsEditing(false);
        setPageState("manage");
      } else {
        setTopics([]);
        setTimeState(parseTo12h("08:00"));
        setIsEditing(true);
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
      showBanner("Add at least one topic first!", false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, topics, scheduleTime, timezone }),
      });
      const data = (await res.json()) as { subscription: Subscription };
      localStorage.setItem("lazybits_email", emailInput.trim());
      setSubscription(data.subscription);
      setIsEditing(false);
      setPageState("manage");
      showBanner("Saved! Your lazy feed is live 🎉", true);
    } catch {
      showBanner("Something went wrong. Please try again.", false);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendNow() {
    setLoading(true);
    try {
      const res = await fetch("/api/send-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      if (res.ok) {
        showBanner("Email sent! Check your inbox 📬", true);
      } else {
        const data = (await res.json()) as { error?: string };
        showBanner(data.error ?? "Something went wrong.", false);
      }
    } catch {
      showBanner("Something went wrong. Please try again.", false);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription? You can always come back!")) return;
    setLoading(true);
    try {
      await fetch(`/api/subscription?email=${encodeURIComponent(emailInput)}`, {
        method: "DELETE",
      });
      localStorage.removeItem("lazybits_email");
      setSubscription(null);
      setPageState("lookup");
      setEmailInput("");
      showBanner("Subscription cancelled. Come back anytime!", true);
    } catch {
      showBanner("Something went wrong. Please try again.", false);
    } finally {
      setLoading(false);
    }
  }

  function addTopic(t?: string) {
    const topic = (t ?? newTopic).trim();
    if (!topic || topics.includes(topic)) return;
    setTopics([...topics, topic]);
    if (!t) setNewTopic("");
  }

  function removeTopic(i: number) {
    setTopics(topics.filter((_, idx) => idx !== i));
  }

  function handleBack() {
    if (pageState === "create") {
      setPageState("lookup");
    } else {
      setIsEditing(false);
      setEditingTz(false);
      setTopics(subscription?.topics ?? []);
      setTimeState(parseTo12h(subscription?.schedule_time ?? "08:00"));
      setTimezone(subscription?.timezone || detectTimezone());
    }
  }

  const canEdit = pageState === "create" || isEditing;

  const currentTitle =
    pageState === "create"
      ? copy.create
      : isEditing
      ? copy.edit
      : copy.manage;

  // ── LOOKUP SCREEN ─────────────────────────────────────────────────────────

  // Show blank screen while auto-login is running so there's no flash
  if (pageState === "lookup" && loading) {
    return (
      <div className="h-screen max-w-sm mx-auto flex flex-col overflow-hidden bg-white">
        <header className="bg-[#0f0f1a] px-5 py-4 flex items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦥</span>
            <span className="text-white font-black text-base tracking-widest uppercase">LazyBits</span>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center bg-white">
          <span className="text-gray-300 text-sm font-bold uppercase tracking-widest animate-pulse">Loading...</span>
        </main>
      </div>
    );
  }

  if (pageState === "lookup") {
    return (
      <div className="h-screen max-w-sm mx-auto flex flex-col overflow-hidden">
        <header className="bg-[#0f0f1a] px-5 py-4 flex items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦥</span>
            <span className="text-white font-black text-base tracking-widest uppercase">
              LazyBits
            </span>
          </div>
        </header>

        <main className="flex-1 flex flex-col bg-white px-5 pt-10 overflow-hidden">
          {/* Title + tagline */}
          <div className="mb-6">
            <h2 className="text-4xl font-black italic uppercase text-[#aaff00] leading-tight">
              {copy.lookup}
            </h2>
            <p className="text-gray-700 text-sm font-medium mt-2">
              Get a daily email dose of what you care about, but apparently not enough to Google it yourself.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="your@email.com"
              className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#aaff00] transition-colors"
            />
            <button
              onClick={handleLookup}
              disabled={loading || !emailInput.trim()}
              className="w-full py-4 bg-[#7b2fff] text-white font-black text-sm uppercase tracking-widest rounded-2xl disabled:opacity-40 active:scale-95 transition-transform"
            >
              {loading ? "CHECKING..." : copy.go}
            </button>
          </div>

          {/* Sloth holding the form */}
          <div className="-mt-1 px-2">
            <SlothArt />
          </div>
        </main>
      </div>
    );
  }

  // ── MAIN SCREEN (create / manage / edit) ──────────────────────────────────

  return (
    <div className="h-screen max-w-sm mx-auto flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#0f0f1a] px-5 py-4 flex items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦥</span>
          <span className="text-white font-black text-base tracking-widest uppercase">
            LazyBits
          </span>
        </div>
      </header>

      {/* Scrollable body */}
      <main className="flex-1 overflow-y-auto bg-white px-4 pt-5 pb-4 space-y-4">
        {/* Banner */}
        {banner && (
          <div
            className={`px-4 py-3 rounded-xl text-sm font-bold ${
              banner.ok ? "bg-[#aaff00] text-black" : "bg-red-100 text-red-700"
            }`}
          >
            {banner.msg}
          </div>
        )}

        {/* Title + email */}
        <div>
          <h2 className="text-[2rem] font-black italic uppercase text-[#aaff00] leading-tight mb-1">
            {currentTitle}
          </h2>
          <p className="text-sm text-gray-400">
            Managing bits for:{" "}
            <span className="text-pink-500 font-semibold">
              {subscription?.email_display ?? emailInput}
            </span>
          </p>
        </div>

        {/* Add topic card */}
        {canEdit && (
          <div className="bg-gray-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <span>⊕</span>
              <span>ADD SOMETHING NEW TO TRACK</span>
            </div>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTopic()}
              placeholder="e.g. Price drops for RTX 4080..."
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#aaff00] transition-colors placeholder-gray-400"
            />

            {/* Trending suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => addTopic(s)}
                    disabled={topics.includes(s)}
                    className="text-[11px] bg-white text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full hover:border-[#aaff00] hover:text-black disabled:opacity-40 transition-colors truncate max-w-[180px] font-medium"
                    title={s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => addTopic()}
              disabled={!newTopic.trim()}
              className="w-full py-3.5 bg-[#aaff00] text-black font-black text-sm uppercase tracking-widest rounded-xl disabled:opacity-40 active:scale-95 transition-transform"
            >
              ADD ⚡
            </button>
          </div>
        )}

        {/* YOUR CURRENT BITS */}
        {topics.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-xs uppercase tracking-widest text-gray-700">
                YOUR CURRENT BITS
              </span>
              <span className="text-xs text-gray-400 font-semibold">
                {topics.length} Topic{topics.length !== 1 ? "s" : ""} Active
              </span>
            </div>
            <div className="space-y-2">
              {topics.map((t, i) => {
                const emoji = pickBy(TOPIC_EMOJIS, t + "emoji");
                const tag = pickBy(TOPIC_TAGS, t + "tag");
                const bg = pickBy(TOPIC_ICON_BG, t + "bg");
                return (
                  <div
                    key={i}
                    className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-xl flex-shrink-0`}
                    >
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-snug">
                        {t}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                        {tag}
                      </p>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => removeTopic(i)}
                        className="text-gray-300 hover:text-red-400 text-2xl leading-none flex-shrink-0 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Manage actions (view mode only) */}
        {pageState === "manage" && !isEditing && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-3.5 bg-[#aaff00] text-black font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-transform"
              >
                ✏️ EDIT BITS
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-3.5 bg-white text-red-400 font-black text-xs uppercase tracking-widest rounded-2xl border border-red-100 active:scale-95 transition-transform disabled:opacity-40"
              >
                💀 CANCEL
              </button>
            </div>
            <button
              onClick={() => { localStorage.removeItem("lazybits_email"); setPageState("lookup"); setEmailInput(""); }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 font-semibold py-2 transition-colors"
            >
              ← Not you? Use a different email
            </button>
          </div>
        )}

        {/* Daily Send Time */}
        <div className="bg-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🕐</span>
            <div className="flex-1">
              <p className="font-black text-sm text-gray-800">Daily Send Time</p>
              <p className="text-xs text-gray-500 mt-0.5">
                When should we bother you with updates?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TimeUnit
              val={String(timeState.hour).padStart(2, "0")}
              onUp={() => setTimeState((s) => ({ ...s, hour: s.hour === 12 ? 1 : s.hour + 1 }))}
              onDown={() => setTimeState((s) => ({ ...s, hour: s.hour === 1 ? 12 : s.hour - 1 }))}
              disabled={!canEdit}
            />
            <span className="text-4xl font-black text-gray-600 pb-1 select-none">:</span>
            <TimeUnit
              val={String(timeState.minute).padStart(2, "0")}
              onUp={() => setTimeState((s) => ({ ...s, minute: s.minute >= 55 ? 0 : s.minute + 5 }))}
              onDown={() => setTimeState((s) => ({ ...s, minute: s.minute <= 0 ? 55 : s.minute - 5 }))}
              disabled={!canEdit}
            />
            {canEdit ? (
              <div className="flex flex-col gap-1.5 ml-3">
                <button
                  onClick={() => setTimeState((s) => ({ ...s, isPm: false }))}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide transition-colors ${
                    !timeState.isPm ? "bg-[#aaff00] text-black" : "bg-white text-gray-400"
                  }`}
                >
                  AM
                </button>
                <button
                  onClick={() => setTimeState((s) => ({ ...s, isPm: true }))}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide transition-colors ${
                    timeState.isPm ? "bg-[#aaff00] text-black" : "bg-white text-gray-400"
                  }`}
                >
                  PM
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-3">
                <span className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide bg-[#aaff00] text-black">
                  {timeState.isPm ? "PM" : "AM"}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Edit time"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Timezone + Send Now row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 text-xs">🌐</span>
              {canEdit && editingTz ? (
                <select
                  value={timezone}
                  onChange={(e) => { setTimezone(e.target.value); setEditingTz(false); }}
                  onBlur={() => setEditingTz(false)}
                  autoFocus
                  className="text-xs text-gray-500 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#aaff00] cursor-pointer"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => canEdit && setEditingTz(true)}
                  className={`text-xs text-gray-400 ${canEdit ? "hover:text-gray-600 underline underline-offset-2 decoration-dotted" : ""} transition-colors`}
                >
                  {timezone}
                </button>
              )}
            </div>
            {!canEdit && (
              <button
                onClick={handleSendNow}
                disabled={loading}
                className="px-3 py-1.5 bg-[#0f0f1a] text-[#aaff00] font-black text-[10px] uppercase tracking-widest rounded-xl active:scale-95 transition-transform disabled:opacity-40"
              >
                {loading ? "..." : "📬 SEND NOW"}
              </button>
            )}
          </div>
        </div>

        {/* Mascot */}
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#0f0f1a] flex items-center justify-center shadow-lg ring-4 ring-[#aaff00]/30">
              <span className="text-4xl">🦥</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#aaff00] flex items-center justify-center text-xs font-black text-black">
              ⚡
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            LAZYBITS CORE PROTOCOL V2.4
          </p>
        </div>
      </main>

      {/* Sticky bottom panel (only in edit/create mode) */}
      {canEdit && (
        <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-3 pb-3 space-y-2">
          <button
            onClick={handleSave}
            disabled={loading || topics.length === 0}
            className="w-full py-4 bg-[#7b2fff] text-white font-black text-sm uppercase tracking-widest rounded-2xl disabled:opacity-40 active:scale-95 transition-transform"
          >
            {loading ? "SAVING..." : copy.save}
          </button>
          <button
            onClick={handleBack}
            className="w-full py-4 bg-gray-200 text-gray-700 font-black text-sm uppercase tracking-widest rounded-2xl active:scale-95 transition-transform"
          >
            {copy.back}
          </button>
        </div>
      )}
    </div>
  );
}
