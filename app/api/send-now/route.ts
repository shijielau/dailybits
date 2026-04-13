import { NextRequest, NextResponse } from "next/server";
import { getSubscription } from "@/lib/db";
import { runGenerateForSubscription } from "@/lib/generate";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string };
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const sub = await getSubscription(email);
    if (!sub || !sub.active) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }
    if (sub.topics.length === 0) {
      return NextResponse.json({ error: "No topics configured" }, { status: 400 });
    }

    const result = await runGenerateForSubscription(sub);
    console.log("[send-now] result:", JSON.stringify(result));
    if (!result.emailSent) {
      return NextResponse.json({ error: result.error ?? "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[send-now] unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
