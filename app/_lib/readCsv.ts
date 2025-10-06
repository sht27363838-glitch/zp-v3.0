// app/_lib/readCsv.ts
// 브라우저 로컬스토리지에 CSV를 저장/읽기 + CSV 파서 + 헤더 검증 유틸

export type DatasetKey =
  | 'kpi_daily'
  | 'creative_results'
  | 'ledger'
  | 'rebalance_log'
  | 'commerce_items'
  | 'subs'
  | 'returns'
  | 'settings'

export type CsvRow = Record<string, string>
export type CsvRows = { headers: string[]; rows: CsvRow[] }

const LS_PREFIX = 'csv:'
const TS_SUFFIX = ':ts'

// === CSV I/O (LocalStorage) ===
export function readCsvLS(key: DatasetKey): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LS_PREFIX + key)
}

export function writeCsvLS(key: DatasetKey, csv: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_PREFIX + key, csv)
  localStorage.setItem(LS_PREFIX + key + TS_SUFFIX, Date.now().toString())
}

export function clearCsvLS(key: DatasetKey) {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LS_PREFIX + key)
  localStorage.removeItem(LS_PREFIX + key + TS_SUFFIX)
}

export function lastSavedAt(key: DatasetKey): number | null {
  if (typeof window === 'undefined') return null
  const v = localStorage.getItem(LS_PREFIX + key + TS_SUFFIX)
  return v ? Number(v) : null
}

// === CSV Parser ===
export function parseCsv(csv: string): CsvRows {
  // 아주 단순한 CSV 파서 (따옴표 포함 간단 처리)
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) return { headers: [], rows: [] }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim())
  const rows: CsvRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i])
    const row: CsvRow = {}
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? '').trim()
    })
    rows.push(row)
  }
  return { headers, rows }
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQ = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        // 이스케이프된 쌍따옴표
        cur += '"'
        i++
      } else {
        inQ = !inQ
      }
    } else if (ch === ',' && !inQ) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

// === 스키마(필수 헤더) 정의 ===
// v2~v3 변천을 고려해 일부 대체 헤더도 허용
export const requiredHeaders: Record<DatasetKey, string[]> = {
  settings: ['last_month_profit', 'cap_ratio', 'edge_min', 'edge_max'],

  kpi_daily: [
    'date',
    'channel',
    'visits',
    'clicks',
    'carts',
    'orders',
    'revenue',
    'ad_cost',
    'returns',
    'reviews',
  ],

  creative_results: [
    'date',
    'creative_id',
    'impressions',
    'clicks',
    'spend',
    'orders',
    'revenue',
  ],

  // v2: stable_amt/edge_amt, v3: stable/edge — 둘 다 허용하도록 검증에서 보완
  ledger: ['date', 'type', /* 'quest_id' (옵션) */],

  rebalance_log: ['date', 'from_to', 'amount', 'reason'],

  commerce_items: ['order_id', 'sku', 'qty', 'price', 'discount', 'source'],

  subs: ['customer_id', 'start_date', 'billing_n', 'status'],

  returns: ['order_id', 'sku', 'reason', 'date'],
}

export const datasetKeys = Object.keys(requiredHeaders) as DatasetKey[]

// === 헤더 검증 ===
export function validateHeaders(
  key: DatasetKey,
  headers: string[],
): { ok: boolean; missing: string[]; extra: string[] } {
  const req = requiredHeaders[key] || []
  const hset = new Set(headers.map((h) => h.trim().toLowerCase()))

  // ledger 특수 처리: stable/edge 컬럼명 호환
  const needsStableEdge =
    key === 'ledger' &&
    !(hset.has('stable') || hset.has('stable_amt')) &&
    !(hset.has('edge') || hset.has('edge_amt'))

  const missing = req.filter((r) => !hset.has(r))
  const extra = headers.filter((h) => !req.includes(h))

  // ledger는 stable/edge 호환성 체크를 미싱에 반영
  if (key === 'ledger' && needsStableEdge) {
    if (!hset.has('stable') && !hset.has('stable_amt')) missing.push('stable')
    if (!hset.has('edge') && !hset.has('edge_amt')) missing.push('edge')
  }

  const ok = missing.length === 0
  return { ok, missing, extra }
}

