'use client'
import { parseCsv, toCsv, readCsvLS, writeCsvLS } from './readCsv'

export type LedgerRow = {
  date:string, mission:string, type:string,
  stable:number, edge:number, note?:string, lock_until?:string
}

export function loadLedger(): LedgerRow[] {
  const raw = readCsvLS('ledger')||''
  const rows = raw? parseCsv(raw) as any[] : []
  return rows.map(r=>({
    date: r.date||r['일자']||'',
    mission: r.mission||r['미션']||'',
    type: r.type||r['유형']||'',
    stable: Number(r.stable||r['안정']||0),
    edge: Number(r.edge||r['잇지']||0),
    note: r.note||r['비고']||'',
    lock_until: r.lock_until||r['락업']||''
  }))
}

export function sumLedger(rows:LedgerRow[]){
  return rows.reduce((a,r)=>({stable:a.stable+r.stable, edge:a.edge+r.edge}), {stable:0, edge:0})
}

export function appendLedger(row:LedgerRow){
  const rows = loadLedger()
  rows.push(row)
  const csv = toCsv(rows, ['date','mission','type','stable','edge','note','lock_until'])
  writeCsvLS('ledger', csv)
}

export function lastTimeKey(key:string){ return Number(localStorage.getItem(key)||0) }
export function markTime(key:string){ localStorage.setItem(key, String(Date.now())) }
