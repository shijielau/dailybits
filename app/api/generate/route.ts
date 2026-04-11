import { NextResponse } from "next/server";
import { runGenerate } from "@/lib/generate";

export async function POST() {
  try {
    const result = await runGenerate();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
