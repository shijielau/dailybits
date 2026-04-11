import { NextResponse } from "next/server";
import { loadSummaries } from "@/lib/storage";

export async function GET() {
  return NextResponse.json(loadSummaries());
}
