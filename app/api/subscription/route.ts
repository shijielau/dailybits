import { NextRequest, NextResponse } from "next/server";
import {
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
} from "@/lib/db";

// GET /api/subscription?email=...
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const sub = await getSubscription(email);
  if (!sub) {
    return NextResponse.json({ exists: false });
  }
  return NextResponse.json({ exists: true, subscription: sub });
}

// POST /api/subscription — create or update
export async function POST(req: NextRequest) {
  const { email, topics, scheduleTime, timezone } = await req.json() as {
    email: string;
    topics: string[];
    scheduleTime: string;
    timezone: string;
  };

  if (!email || !topics || !scheduleTime) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const tz = timezone || "UTC";
  const existing = await getSubscription(email);
  const sub = existing
    ? await updateSubscription(email, topics, scheduleTime, tz)
    : await createSubscription(email, topics, scheduleTime, tz);

  return NextResponse.json({ subscription: sub });
}

// DELETE /api/subscription?email=...
export async function DELETE(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  await cancelSubscription(email);
  return NextResponse.json({ success: true });
}
