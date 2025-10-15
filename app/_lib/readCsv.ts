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

// v3.5: CSV 파싱 캐시
const __csvCache = new Map<string, ReturnType<typeof parseCsv>>()

export function parseCsvCached(raw: string){
  if(!raw) return { headers: [], rows: [] }
  const hit = __csvCache.get(raw)
  if(hit) return hit
  const out = parseCsv(raw)
  __csvCache.set(raw, out)
  return out
}

import { DEMO_KPI } from './demo'

export function readCsvOrDemo(key: string){
  const raw = readCsvLS(key) || ''
  if (raw && raw.trim().split('\n').length > 1) return raw
  if (key === 'kpi_daily') return DEMO_KPI   // 키별 데모 매핑
  return raw
}

// === 데모 CSV 샘플 ===
const DEMO_KPI = `date,channel,product,visits,clicks,orders,revenue,ad_cost,returns,week_index
2025-09-25,ads,sku-1,1200,240,18,540000,180000,2,0
2025-09-26,ads,sku-2,900,180,12,360000,120000,1,0
2025-09-27,organic,sku-1,800,64,6,180000,0,1,0
2025-09-28,social,sku-3,700,90,7,210000,70000,1,0
2025-09-29,ads,sku-1,1000,210,16,480000,160000,1,0
2025-09-30,organic,sku-2,750,70,5,150000,0,0,0
2025-10-01,social,sku-3,820,92,8,240000,80000,1,0
`;
const DEMO_LEDGER = `date,mission,type,stable,edge,note,lock_until
2025-09-25,Daily Loop,daily,120000,30000,, 
2025-09-26,Daily Loop,daily,120000,30000,, 
2025-09-27,Daily Loop,daily,120000,0,EDGE LOCK, 
`;

// 로컬스토리지에서 읽기(SSR 안전)
export function readCsvLS(key: string): string {
  if (typeof window === 'undefined') return '';
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

// 데이터가 비어 있으면 데모로 대체
export function readCsvOrDemo(key: 'kpi_daily' | 'ledger' | 'settings'): string {
  const raw = readCsvLS(key);
  if (raw && raw.trim()) return raw;
  if (key === 'kpi_daily') return DEMO_KPI;
  if (key === 'ledger') return DEMO_LEDGER;
  return '';
}

// 버튼으로 데모 주입
export function injectDemo(key: 'kpi_daily' | 'ledger'): void {
  if (typeof window === 'undefined') return;
  const val = key === 'kpi_daily' ? DEMO_KPI : DEMO_LEDGER;
  try {
    localStorage.setItem(key, val);
    alert(`✅ 데모 ${key} 주입 완료`);
  } catch (e) {
    alert('로컬스토리지 쓰기에 실패했습니다.');
  }
}


