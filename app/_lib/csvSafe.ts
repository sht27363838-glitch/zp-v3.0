'use client'
/**
 * csvSafe — 데모 주입/소스 배지/헤더검증/파싱캐시 모듈 (클라이언트 안전)
 * - readCsvOrDemo: 로컬스토리지 값이 비정상이면 데모로 자동 대체
 * - parseCsvCached: CSV 파싱 결과 캐시
 * - validate: 페이지별 필수 헤더 검증
 * - injectDemo/resetDemo/sourceTag: 도구 버튼/배지용
 */

import { parseCsv, type CsvTable, type CsvRow } from './readCsv'

/* =========================
 * 로컬스토리지 helpers
 * ========================= */
export function readCsvLS(key: string): string {
  if (typeof window === 'undefined') return ''
  try { return localStorage.getItem(key) || '' } catch { return '' }
}
export function writeCsvLS(key: string, csv: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, csv)
    localStorage.setItem(`${key}.__ts`, String(Date.now()))
  } catch {}
}
export function clearCsvLS(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
    localStorage.removeItem(`${key}.__ts`)
  } catch {}
}

/* =========================
 * 데모 CSV
 * ========================= */
const DEMO_KPI_DAILY = `date,channel,product,visits,clicks,orders,revenue,ad_cost,returns,week_index
2025-09-25,ads,sku-1,1200,240,18,540000,180000,2,0
2025-09-26,ads,sku-2,900,180,12,360000,120000,1,0
2025-09-27,organic,sku-1,800,64,6,180000,0,1,0
2025-09-28,social,sku-3,700,90,7,210000,70000,1,0
2025-09-29,ads,sku-1,1000,210,16,480000,160000,1,0
2025-09-30,organic,sku-2,750,70,5,150000,0,0,0
2025-10-01,social,sku-3,820,92,8,240000,80000,1,0
`

const DEMO_LEDGER = `date,mission,type,stable,edge,note,lock_until
2025-09-25,Daily Loop,daily,120000,30000,,
2025-09-26,Daily Loop,daily,120000,30000,,
2025-09-27,Daily Loop,daily,120000,0,EDGE LOCK,
`

const DEMO_SETTINGS = `last_month_profit,month_goal
1000000,3000000
`

/* =========================
 * readCsvOrDemo: 비정상이면 데모로 대체
 * ========================= */
export function readCsvOrDemo(key: 'kpi_daily'|'ledger'|'settings'): string {
  const raw = readCsvLS(key)
  try {
    if (raw && raw.trim().split('\n').length > 1) return raw
  } catch {
    // noop → 아래에서 데모로 대체
  }
  if (key === 'kpi_daily') return DEMO_KPI_DAILY
  if (key === 'ledger')    return DEMO_LEDGER
  if (key === 'settings')  return DEMO_SETTINGS
  return ''
}

/* =========================
 * 파싱 캐시
 * ========================= */
const __cache = new Map<string, CsvTable>()
export function parseCsvCached(key: string): CsvTable {
  const raw = readCsvLS(key) || ''
  if (!raw) return { headers: [], rows: [] }
  const hit = __cache.get(raw)
  if (hit) return hit
  const table = parseCsv(raw)
  __cache.set(raw, table)
  return table
}

/* =========================
 * 스키마 검증(간단)
 * ========================= */
export const REQUIRED: Record<string, string[]> = {
  kpi_daily: ['date','channel','visits','clicks','orders','revenue','ad_cost','returns'],
  ledger:    ['date','mission','type','stable','edge','note','lock_until'],
  settings:  ['last_month_profit'],
}
export function validate(key: keyof typeof REQUIRED, table: CsvTable){
  const need = new Set(REQUIRED[key] || [])
  const have = new Set((table.headers as string[]) || [])
  const missing = [...need].filter(h => !have.has(h))
  return { ok: missing.length === 0, missing }
}

/* =========================
 * 숫자 유틸
 * ========================= */
export const n = (v:any)=> Number(v||0) || 0

/* =========================
 * 데모 주입/초기화 + 소스 배지
 * ========================= */
export function injectDemo(key:'kpi_daily'|'ledger'|'settings'){
  if (typeof window === 'undefined') return
  const demo = key==='kpi_daily' ? DEMO_KPI_DAILY
            : key==='ledger'     ? DEMO_LEDGER
            :                      DEMO_SETTINGS
  localStorage.setItem(key, demo.trim())
  localStorage.setItem(`${key}.__ts`, String(Date.now()))
  location.reload()
}
export function resetDemo(keys: Array<'kpi_daily'|'ledger'|'settings'>) {
  if (typeof window === 'undefined') return
  for (const k of keys) {
    localStorage.removeItem(k)
    localStorage.removeItem(`${k}.__ts`)
  }
  location.reloa
export function clearToLive(
  keys: Array<'kpi_daily'|'ledger'|'settings'> = ['kpi_daily','ledger','settings']
){
  resetDemo(keys) // 내부에서 reload 처리함
}
export function sourceTag(key:'kpi_daily'|'ledger'|'settings'): 'DEMO' | 'LIVE' {
  const raw = readCsvLS(key)
  if (!raw) return 'DEMO'
  // 길이/헤더 형태로 아주 러프하게 판별(실데이터일 가능성)
  const lines = raw.trim().split('\n')
  return lines.length > 1 ? 'LIVE' : 'DEMO'
}

