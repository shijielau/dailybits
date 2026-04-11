import { NextRequest, NextResponse } from "next/server";
import { loadConfig, saveConfig } from "@/lib/storage";
import type { Config } from "@/lib/storage";

export async function GET() {
  return NextResponse.json(loadConfig());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Config>;
  const current = loadConfig();
  const updated: Config = { ...current, ...body };
  saveConfig(updated);
  return NextResponse.json(updated);
}
