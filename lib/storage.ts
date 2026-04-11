import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export interface Config {
  topics: string[];
  email: string;
  scheduleTime: string; // "HH:MM" in 24h format
}

const DEFAULT_CONFIG: Config = {
  topics: [],
  email: "",
  scheduleTime: "08:00",
};

export function loadConfig(): Config {
  ensureDataDir();
  const path = join(DATA_DIR, "config.json");
  if (!existsSync(path)) {
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }
  return JSON.parse(readFileSync(path, "utf-8")) as Config;
}

export function saveConfig(config: Config): void {
  ensureDataDir();
  writeFileSync(join(DATA_DIR, "config.json"), JSON.stringify(config, null, 2));
}

export interface Summary {
  id: string;
  generatedAt: string;
  content: string;
  emailSent: boolean;
  emailTo: string;
}

export function loadSummaries(): Summary[] {
  ensureDataDir();
  const path = join(DATA_DIR, "summaries.json");
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf-8")) as Summary[];
}

export function saveSummary(summary: Summary): void {
  const summaries = loadSummaries();
  summaries.unshift(summary);
  writeFileSync(
    join(DATA_DIR, "summaries.json"),
    JSON.stringify(summaries.slice(0, 30), null, 2)
  );
}
