import { NextResponse } from "next/server";
import { getActiveSubscriptions } from "@/lib/db";
import { runGenerateForSubscription } from "@/lib/generate";

export async function POST() {
  try {
    const subscriptions = await getActiveSubscriptions();
    if (subscriptions.length === 0) {
      return NextResponse.json({ success: false, error: "No active subscriptions" }, { status: 400 });
    }
    const results = await Promise.all(subscriptions.map(runGenerateForSubscription));
    return NextResponse.json({ success: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
