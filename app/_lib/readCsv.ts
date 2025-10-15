export type CsvRow = Record<string, any>;
export type CsvTable = { headers: string[]; rows: CsvRow[] };

/** 아주 관대한 CSV 파서 (따옴표/콤마 최소 처리) */
export function parseCsv(csv: string): CsvTable {
  if (!csv || !csv.trim()) return { headers: [], rows: [] };
  const lines = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  const headers = (lines.shift() || "").split(",").map(h => h.trim());

  const rows: CsvRow[] = [];
  for (const ln of lines) {
    const cols = ln.split(","); // 단순 분리(데모/내부 csv 기준)
    const r: CsvRow = {};
    headers.forEach((h, i) => (r[h] = cols[i] ?? ""));
    rows.push(r);
  }
  return { headers, rows };
}

/* ---------------- LS 유틸 ---------------- */
export function readCsvLS(key: string): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}
export function writeCsvLS(key: string, csv: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, csv);
    localStorage.setItem(`${key}.__ts`, String(Date.now()));
  } catch {}
}
export function clearCsvLS(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}.__ts`);
  } catch {}
}
export function lastSavedAt(key: string): number {
  if (typeof window === "undefined") return 0;
  try { return Number(localStorage.getItem(`${key}.__ts`) || 0); } catch { return 0; }
}

/* ---------------- 검증/도구 ---------------- */
export const datasetKeys = [
  "kpi_daily","ledger","creative_results","rebalance_log",
  "commerce_items","subs","returns","settings",
] as const;
export type DatasetKey = (typeof datasetKeys)[number];

export const requiredHeaders: Record<DatasetKey, string[]> = {
  kpi_daily: ["date","channel","visits","clicks","carts","orders","revenue","ad_cost","returns","reviews"],
  ledger: ["date","mission","type","stable","edge","note","lock_until"],
  creative_results: [],
  rebalance_log: [],
  commerce_items: [],
  subs: [],
  returns: [],
  settings: ["last_month_profit"],
};

export function validateHeaders(csv: string, key: DatasetKey): string[] {
  const need = requiredHeaders[key] || [];
  if (!need.length) return [];
  const { headers } = parseCsv(csv || "");
  const have = new Set(headers.map(h => h.trim()));
  return need.filter(h => !have.has(h));
}

export function toCsv(table: CsvTable): string {
  const { headers, rows } = table;
  const head = headers.join(",");
  const body = rows.map(r => headers.map(h => (r[h] ?? "") as string).join(",")).join("\n");
  return head + (body ? "\n" + body : "");
}

/* ---------------- 파싱 캐시 ---------------- */
const __csvCache = new Map<string, ReturnType<typeof parseCsv>>();
export function parseCsvCached(raw: string) {
  if (!raw) return { headers: [], rows: [] };
  const hit = __csvCache.get(raw);
  if (hit) return hit;
  const out = parseCsv(raw);
  __csvCache.set(raw, out);
  return out;
}

/* ---------------- 데모 주입/대체 ---------------- */
import { DEMO_KPI, DEMO_LEDGER } from "./demo";

export function readCsvOrDemo(key: "kpi_daily" | "ledger" | "settings"): string {
  const raw = readCsvLS(key);
  if (raw && raw.trim()) return raw;
  if (key === "kpi_daily") return DEMO_KPI;
  if (key === "ledger") return DEMO_LEDGER;
  return "";
}

export function injectDemo(key: "kpi_daily" | "ledger"): void {
  if (typeof window === "undefined") return;
  const val = key === "kpi_daily" ? DEMO_KPI : DEMO_LEDGER;
  try {
    localStorage.setItem(key, val);
    localStorage.setItem(`${key}.__ts`, String(Date.now()));
    alert(`✅ 데모 ${key} 주입 완료`);
  } catch {
    alert("로컬스토리지 쓰기에 실패했습니다.");
  }
}
