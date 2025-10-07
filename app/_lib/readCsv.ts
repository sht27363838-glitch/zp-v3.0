// app/_lib/readCsv.ts

export type CsvRow = Record<string, any>;
export type CsvTable = { headers: string[]; rows: CsvRow[] };

/** 간단 CSV 파서: 첫 줄은 헤더, 이후는 데이터 */
export function parseCsv(text: string): CsvTable {
  const src = (text || "").trim();
  if (!src) return { headers: [], rows: [] };

  const lines = src.split(/\r?\n/);
  const headers = (lines.shift() || "").split(",").map((h) => h.trim());

  const rows: CsvRow[] = lines
    .map((line) => line.split(","))
    .map((cols) => {
      const row: CsvRow = {};
      headers.forEach((h, i) => (row[h] = (cols[i] ?? "").trim()));
      return row;
    });

  return { headers, rows };
}

/** 로컬스토리지에서 CSV 원문 읽기 (SSR 안전) */
export function readCsvLS(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

/** 로컬스토리지에 CSV 저장 (+ 타임스탬프 보조키) */
export function writeCsvLS(key: string, csv: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, csv);
    localStorage.setItem(`${key}.__ts`, String(Date.now()));
  } catch {}
}

/** 로컬스토리지 CSV/타임스탬프 삭제 */
export function clearCsvLS(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}.__ts`);
  } catch {}
}

/** 마지막 저장 시각(Unix ms) */
export function lastSavedAt(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(`${key}.__ts`) || 0);
  } catch {
    return 0;
  }
}

/** 데이터셋 키 */
export const datasetKeys = [
  "kpi_daily",
  "ledger",
  "creative_results",
  "rebalance_log",
  "commerce_items",
  "subs",
  "returns",
  "settings",
] as const;
export type DatasetKey = (typeof datasetKeys)[number];

/** 필수 헤더(필요한 것만 최소) */
export const requiredHeaders: Record<DatasetKey, string[]> = {
  kpi_daily: [
    "date",
    "channel",
    "visits",
    "clicks",
    "carts",
    "orders",
    "revenue",
    "ad_cost",
    "returns",
    "reviews",
  ],
  ledger: ["date", "mission", "type", "stable", "edge", "note", "lock_until"],
  creative_results: [],
  rebalance_log: [],
  commerce_items: [],
  subs: [],
  returns: [],
  settings: ["last_month_profit"],
};

/** 헤더 검증: 누락된 헤더 목록 반환 */
export function validateHeaders(csv: string, key: DatasetKey): string[] {
  const need = requiredHeaders[key] || [];
  if (!need.length) return [];
  const { headers } = parseCsv(csv || "");
  const have = new Set(headers.map((h) => h.trim()));
  return need.filter((h) => !have.has(h));
}

/** 테이블 → CSV 문자열 */
export function toCsv(table: CsvTable): string {
  const { headers, rows } = table;
  const head = headers.join(",");
  const body = rows
    .map((r) => headers.map((h) => (r[h] ?? "") as string).join(","))
    .join("\n");
  return head + (body ? "\n" + body : "");
}
