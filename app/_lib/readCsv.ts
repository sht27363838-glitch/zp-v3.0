// app/_lib/readCsv.ts
'use client'

/** ===== Types ===== */
export type CsvRow = Record<string, any>
export type CsvTable = { headers: string[]; rows: CsvRow[] }

export type DatasetKey =
  | 'kpi_daily'
  | 'creative_results'
  | 'ledger'
  | 'rebalance_log'
  | 'commerce_items'
  | 'subs'
  | 'returns'
  | 'settings'

/** 필수 헤더(검증용 — 없는 키는 자유 형식) */
export const requiredHeaders: Partial<Record<DatasetKey, string[]>> = {
  kpi_daily: ['date', 'channel', 'visits', 'clicks', 'carts', 'orders', 'revenue', 'ad_cost', 'returns', 'reviews'],
  creative_results: ['date', 'creative_id', 'impressions', 'clicks', 'spend', 'orders', 'revenue'],
  ledger: ['date', 'mission', 'type', 'stable', 'edge', 'note', 'lock_until', 'proof_url'],
  settings: ['last_month_profit', 'cap_ratio'],
}

/** 프로젝트에서 쓰는 DS 키 목록 */
export const datasetKeys: DatasetKey[] = [
  'kpi_daily',
  'creative_results',
  'ledger',
  'rebalance_log',
  'commerce_items',
  'subs',
  'returns',
  'settings',
]

/** ===== CSV utils ===== */

/** 매우 단순한 CSV 파서 — 따옴표 없는 정상 데이터 전제 */
export function parseCsv(text: string): CsvTable {
  const lines = (text || '').trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map(h => h.trim())
  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',')
    const row: CsvRow = {}
    headers.forEach((h, idx) => (row[h] = (cells[idx] ?? '').trim()))
    rows.push(row)
  }
  return { headers, rows }
}

/** 간단 CSV 생성기 */
export function toCsv(headers: string[], rows: CsvRow[]): string {
  const head = headers.join(',')
  const body = rows
    .map(r => headers.map(h => (r[h] ?? '')).join(','))
    .join('\n')
  return [head, body].filter(Boolean).join('\n')
}

/** ===== localStorage layer ===== */
const LS_PREFIX = 'csv:'

export function readCsvLS(key: DatasetKey | string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LS_PREFIX + key)
}

export function writeCsvLS(key: DatasetKey | string, text: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_PREFIX + key, text)
  localStorage.setItem(`${LS_PREFIX}${key}:ts`, String(Date.now()))
}

export function clearCsvLS(key: DatasetKey | string) {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LS_PREFIX + key)
  localStorage.removeItem(`${LS_PREFIX}${key}:ts`)
}

export function lastSavedAt(key: DatasetKey | string): number {
  if (typeof window === 'undefined') return 0
  const v = localStorage.getItem(`${LS_PREFIX}${key}:ts`)
  return v ? Number(v) : 0
}

/** 헤더 검증 */
export function validateHeaders(text: string, key: DatasetKey) {
  const need = requiredHeaders[key]
  if (!need || !need.length) return { ok: true, missing: [] as string[] }
  const { headers } = parseCsv(text || '')
  const missing = need.filter(h => !headers.includes(h))
  return { ok: missing.length === 0, missing }
}

/** 과거 코드 호환용 별칭(export) */
export const readCsvFromLocal = readCsvLS
export const readCsv = readCsvLS
