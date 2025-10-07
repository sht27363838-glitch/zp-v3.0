// app/_lib/readCsv.ts
// 로컬스토리지 기반 CSV 관리 + 파서/직렬화 유틸
export type CsvRow = Record<string, string | number | null>;
export type CsvTable = { headers: string[]; rows: CsvRow[] };

export type DatasetKey =
  | 'kpi_daily'
  | 'ledger'
  | 'creative_results'
  | 'rebalance_log'
  | 'commerce_items'
  | 'subs'
  | 'returns'
  | 'settings';

export const datasetKeys: DatasetKey[] = [
  'kpi_daily',
  'ledger',
  'creative_results',
  'rebalance_log',
  'commerce_items',
  'subs',
  'returns',
  'settings',
];

const LS_PREFIX = 'zp3.csv.';

const hasWindow = () => typeof window !== 'undefined';

// 로컬스토리지 I/O
export function readCsvLS(key: string): string {
  if (typeof window === 'undefined') return '';          // SSR 안전
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
  export function pct1(v:number, digits=1){ return `${(v*100).toFixed(digits)}%`;

}


export const writeCsvLS = (key: DatasetKey, csv: string) => {
  if (!hasWindow()) return;
  localStorage.setItem(LS_PREFIX + key, csv || '');
  localStorage.setItem(LS_PREFIX + key + '.ts', String(Date.now()));
};

export const clearCsvLS = (key: DatasetKey) => {
  if (!hasWindow()) return;
  localStorage.removeItem(LS_PREFIX + key);
  localStorage.removeItem(LS_PREFIX + key + '.ts');
};

export const lastSavedAt = (key: DatasetKey): number => {
  if (!hasWindow()) return 0;
  return Number(localStorage.getItem(LS_PREFIX + key + '.ts') || 0);
};

// CSV <-> Table
export function parseCsv(csv: string): CsvTable {
  const lines = (csv || '').trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((s) => s.trim());
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',');
    const obj: CsvRow = {};
    headers.forEach((h, i) => (obj[h] = cols[i] ?? ''));
    return obj;
  });
  return { headers, rows };
}

export function toCsv(table: CsvTable): string {
  const { headers, rows } = table;
  const head = headers.join(',');
  const body = rows
    .map((r) => headers.map((h) => (r[h] ?? '')).join(','))
    .join('\n');
  return [head, body].filter(Boolean).join('\n');
}

// 스키마 검증 도우미 (업로드 위저드에서 사용)
export const requiredHeaders: Record<DatasetKey, string[]> = {
  kpi_daily: ['date', 'channel', 'visits', 'clicks', 'carts', 'orders', 'revenue', 'ad_cost', 'returns', 'reviews'],
  ledger: ['date', 'mission', 'type', 'stable', 'edge', 'note', 'lock_until'],
  creative_results: ['date', 'asset', 'channel', 'clicks', 'spend', 'orders', 'revenue'],
  rebalance_log: ['date', 'from', 'to', 'amount', 'note'],
  commerce_items: ['date', 'sku', 'source', 'views', 'adds', 'orders', 'revenue'],
  subs: ['date', 'signups', 'churn'],
  returns: ['date', 'orders', 'return_qty'],
  settings: ['key', 'value'],
};

export type HeaderValidation = { ok: boolean; missing: string[]; extra: string[] };
export function validateHeaders(csv: string, key: DatasetKey): HeaderValidation {
  const need = requiredHeaders[key] || [];
  const { headers } = parseCsv(csv);
  const missing = need.filter((h) => !headers.includes(h));
  const extra = headers.filter((h) => !need.includes(h));
  return { ok: missing.length === 0, missing, extra };
}
