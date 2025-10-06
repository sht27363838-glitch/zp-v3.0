// 단일 진실 소스: CSV IO + 파서 + 검증 (SSR 안전)
'use client';

export type CsvRow = Record<string, string>;
export type CsvRows = CsvRow[];

export type DatasetKey =
  | 'kpi_daily' | 'creative_results' | 'ledger' | 'rebalance_log'
  | 'commerce_items' | 'subs' | 'returns' | 'settings';

export const datasetKeys: DatasetKey[] = [
  'kpi_daily','creative_results','ledger','rebalance_log',
  'commerce_items','subs','returns','settings'
];

// SSR 가드
const hasWindow = () => typeof window !== 'undefined';

// 로컬스토리지 헬퍼
const lsGet = (k: string) => (hasWindow() ? window.localStorage.getItem(k) : null);
const lsSet = (k: string, v: string) => { if (hasWindow()) window.localStorage.setItem(k, v); };
const lsDel = (k: string) => { if (hasWindow()) window.localStorage.removeItem(k); };

export const lastSavedAt = (ds: DatasetKey) => {
  const ts = lsGet(`csv:${ds}:ts`); return ts ? Number(ts) : 0;
};

export const readCsvLS = (ds: DatasetKey): string | null => lsGet(`csv:${ds}`) || null;
export const writeCsvLS = (ds: DatasetKey, raw: string) => {
  lsSet(`csv:${ds}`, raw); lsSet(`csv:${ds}:ts`, String(Date.now()));
};
export const clearCsvLS = (ds: DatasetKey) => {
  lsDel(`csv:${ds}`); lsDel(`csv:${ds}:ts`);
};

// CSV 파서 (항상 배열 반환) — 계약 고정
export function parseCsv(raw: string): CsvRows {
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CsvRows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i], headers.length);
    const r: CsvRow = {};
    headers.forEach((h, idx) => r[h] = (cells[idx] ?? '').trim());
    rows.push(r);
  }
  return rows;
}

// 간단한 CSV 라인 분리(따옴표 대응 최소)
function splitCsvLine(line: string, maxCols: number): string[] {
  const out: string[] = [];
  let cur = '', inQ = false;
  for (let i=0;i<line.length;i++){
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { out.push(cur); cur=''; continue; }
    cur += ch;
  }
  out.push(cur);
  while(out.length < maxCols) out.push('');
  return out;
}

// 필수 헤더 정의(계약 고정)
export const requiredHeaders: Record<DatasetKey, string[]> = {
  settings: ['last_month_profit','cap_ratio','edge_min','edge_max'],
  kpi_daily: ['date','channel','visits','clicks','carts','orders','revenue','ad_cost','returns','reviews'],
  creative_results: ['date','creative_id','impressions','clicks','spend','orders','revenue'],
  ledger: ['date','quest_id','type','stable_amt','edge_amt','lock_until','proof_url'],
  rebalance_log: ['date','from_to','amount','reason'],
  commerce_items: ['order_id','sku','qty','price','discount','source'],
  subs: ['customer_id','start_date','billing_n','status'],
  returns: ['order_id','sku','reason','date'],
};

// 헤더 검증 유틸
export function validateHeaders(raw: string, ds: DatasetKey) {
  const need = requiredHeaders[ds] || [];
  const first = (raw.split(/\r?\n/)[0] || '').trim();
  if (!first) return { ok:false, missing: need };
  const have = first.split(',').map(s => s.trim());
  const missing = need.filter(h => !have.includes(h));
  return { ok: missing.length===0, missing };
}
