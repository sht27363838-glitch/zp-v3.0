// app/_lib/csvSafe.ts
'use client'
import { parseCsv, type CsvRow, type CsvTable, readCsvLS } from './readCsv'

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

// 페이지별 필수 헤더(간단)
export const REQUIRED: Record<string, string[]> = {
  kpi_daily: ['date','channel','visits','clicks','orders','revenue','ad_cost','returns'],
  ledger: ['date','mission','type','stable','edge','note'],
  settings: ['last_month_profit'],
}

export function validate(key: keyof typeof REQUIRED, table: CsvTable){
  const need = new Set(REQUIRED[key])
  const has  = new Set((table.headers as string[]) || [])
  const missing = [...need].filter(h => !has.has(h))
  return { ok: missing.length === 0, missing }
}

// 안전 숫자 변환
export const n = (v:any)=> Number(v||0) || 0
