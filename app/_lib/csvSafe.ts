// app/_lib/csvSafe.ts
'use client'

import { parseCsv, type CsvTable, readCsvLS } from './readCsv'

/** ===== CSV 캐시 ===== */
type Cache = Record<string, { raw: string; table: CsvTable }>
const cache: Cache = {}

export function parseCsvCached(key: string): CsvTable {
  const raw = readCsvLS(key) || ''
  if (!raw) return { headers: [], rows: [] }
  const hit = cache[key]
  if (hit && hit.raw === raw) return hit.table
  const table = parseCsv(raw)
  cache[key] = { raw, table }
  return table
}

/** ===== 스키마 검증 ===== */
export const REQUIRED: Record<string, string[]> = {
  kpi_daily: ['date','channel','visits','clicks','orders','revenue','ad_cost','returns'],
  ledger: ['date','mission','type','stable','edge','note'],
  settings: ['last_month_profit'],
}

export function validate(key: keyof typeof REQUIRED, table: CsvTable){
  const need = new Set(REQUIRED[key] || [])
  const has  = new Set((table.headers as string[]) || [])
  const missing = [...need].filter(h => !has.has(h))
  return { ok: missing.length === 0, missing }
}

/** 안전 숫자 */
export const n = (v:any)=> Number(v||0) || 0

/** ===== DEMO 데이터 ===== */
const DEMO_KPI_DAILY = `date,channel,product,visits,clicks,orders,revenue,ad_cost,returns,week_index
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

/** ===== DEMO/LIVE 판별 & 로더 ===== */
export function readCsvOrDemo(key: 'kpi_daily'|'ledger'|'settings'): string {
  const raw = readCsvLS(key) || ''
  if (raw && raw.trim()) return raw
  if (key === 'kpi_daily') return DEMO_KPI_DAILY
  if (key === 'ledger')    return DEMO_LEDGER
  return raw
}

export function sourceTag(key: 'kpi_daily'|'ledger'|'settings'): 'DEMO'|'LIVE' {
  const raw = readCsvLS(key) || ''
  return raw && raw.trim() ? 'LIVE' : 'DEMO'
}

/** ===== DEMO 주입/초기화 ===== */
export function injectDemo(key:'kpi_daily'|'ledger'){
  if(typeof window==='undefined') return
  const demo = key==='kpi_daily'? DEMO_KPI_DAILY : DEMO_LEDGER
  localStorage.setItem(key, demo.trim())
  localStorage.setItem(`${key}.__ts`, String(Date.now()))
  location.reload()
}

/** 여러 키를 한 번에 초기화(LIVE로 복귀) */
export function resetDemo(keys: Array<'kpi_daily'|'ledger'|'settings'>) {
  if (typeof window === 'undefined') return
  for (const k of keys) {
    localStorage.removeItem(k)
    localStorage.removeItem(`${k}.__ts`)
  }
  location.reload()
}

/** 별칭: 기본 전체 초기화 */
export function clearToLive(
  keys: Array<'kpi_daily'|'ledger'|'settings'> = ['kpi_daily','ledger','settings']
){
  resetDemo(keys)
}


