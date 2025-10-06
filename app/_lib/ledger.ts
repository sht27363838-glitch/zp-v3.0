// app/_lib/ledger.ts
'use client'

import { parseCsv, toCsv, readCsvLS, writeCsvLS } from './readCsv'

export type LedgerRow = {
  date: string
  mission: string
  type: 'daily' | 'weekly' | 'monthly'
  stable: number
  edge: number
  note?: string
  lock_until?: string
  proof_url?: string
}

const LEDGER_KEY = 'ledger'

export function appendLedger(row: LedgerRow) {
  const raw = readCsvLS(LEDGER_KEY) || ''
  const have = raw ? parseCsv(raw) : { headers: [], rows: [] }
  // 헤더 표준화
  const headers = have.headers.length
    ? have.headers
    : ['date', 'mission', 'type', 'stable', 'edge', 'note', 'lock_until', 'proof_url']
  const newRows = [...have.rows, row]
  const csv = toCsv(headers, newRows)
  writeCsvLS(LEDGER_KEY, csv)
}

export function lastTimeKey(key: string): number {
  if (typeof window === 'undefined') return 0
  const v = localStorage.getItem(`cooldown:${key}`)
  return v ? Number(v) : 0
}

export function markTime(key: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`cooldown:${key}`, String(Date.now()))
}
