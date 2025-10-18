'use client'
import { parseCsv, type CsvTable } from './readCsv'
import { migrateKpi } from './csvMigrate'

type Cache = Record<string, { raw:string; table:CsvTable }>
const cache: Cache = {}

/** 로컬스토리지 안전 읽기 */
export function readCsvLS(key:string): string{
  if(typeof window==='undefined') return ''
  try{ return localStorage.getItem(key)||'' }catch{ return '' }
}
export function writeCsvLS(key:string, csv:string){
  if(typeof window==='undefined') return
  try{
    localStorage.setItem(key, csv)
    localStorage.setItem(`${key}.__ts`, String(Date.now()))
  }catch{}
}
export function clearCsvLS(key:string){
  if(typeof window==='undefined') return
  try{
    localStorage.removeItem(key); localStorage.removeItem(`${key}.__ts`)
  }catch{}
}
export function readCsvOrDemo(key:'kpi_daily'|'ledger'|'settings'): string {
  try {
    const raw = readCsvLS(key) || ''
    if (!raw.trim()) return key==='kpi_daily' ? DEMO_KPI : raw
    const safe = key==='kpi_daily' ? migrateKpi(raw) : raw
    return safe
  } catch {
    // 파손 시 초기화 + 데모
    if (key==='kpi_daily') return DEMO_KPI
    return ''
  }

/** 데모 샘플 */
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

/** 데모 주입/초기화 + 소스 배지 */
export function injectDemo(key:'kpi_daily'|'ledger'){
  if(typeof window==='undefined') return
  const demo = key==='kpi_daily'? DEMO_KPI_DAILY : DEMO_LEDGER
  localStorage.setItem(key, demo.trim())
  localStorage.setItem(`${key}.__source`, 'DEMO')
  location.reload()
}
export function clearToLive(key:'kpi_daily'|'ledger'|'settings'){
  if(typeof window==='undefined') return
  localStorage.removeItem(key)
  localStorage.setItem(`${key}.__source`, 'LIVE')
  location.reload()
}
export function sourceTag(key:'kpi_daily'|'ledger'|'settings'){
  if(typeof window==='undefined') return 'LIVE'
  return localStorage.getItem(`${key}.__source`) || 'LIVE'
}

/** parse 캐시 (키 기준) */
export function parseCsvCached(key:string): CsvTable{
  const raw = readCsvLS(key)||''
  if(!raw) return {headers:[], rows:[]}
  const hit = cache[key]
  if(hit && hit.raw===raw) return hit.table
  const table = parseCsv(raw)
  cache[key] = {raw, table}
  return table
}

/** 페이지 요구 헤더 */
export const REQUIRED: Record<string, string[]> = {
  kpi_daily:['date','channel','visits','clicks','orders','revenue','ad_cost','returns'],
  ledger:['date','mission','type','stable','edge','note'],
  settings:['last_month_profit'],
}
export function validate(key: keyof typeof REQUIRED, table: CsvTable){
  const need = new Set(REQUIRED[key]||[])
  if(!need.size) return {ok:true, missing:[] as string[]}
  const have = new Set((table.headers as string[])||[])
  const missing = [...need].filter(h=>!have.has(h))
  return {ok:missing.length===0, missing}
}

/** 안전한 “데모 or 실데이터” 로더 */
export function readCsvOrDemo(key:'kpi_daily'|'ledger'|'settings'): string{
  try{
    const raw = readCsvLS(key)||''
    if(raw && raw.trim().split('\n').length>1){
      localStorage.setItem(`${key}.__source`,'LIVE'); return raw
    }
  }catch{/* ignore */}
  // 비정상/비어있으면 데모로
  const demo = key==='kpi_daily'? DEMO_KPI_DAILY
            : key==='ledger'? DEMO_LEDGER : ''
  if(demo){ try{ localStorage.setItem(`${key}.__source`,'DEMO') }catch{} }
  return demo
}

/** 숫자 안전 변환 */
export const n = (v:any)=> Number(v||0)||0
