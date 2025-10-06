// 원클릭 보상 기입용 레저 헬퍼
'use client';

import { readCsvLS, writeCsvLS, parseCsv, type CsvRow } from './readCsv';
import { fmt, num } from './num';

export function lastTimeKey(key: string): number {
  if (typeof window==='undefined') return 0;
  const v = window.localStorage.getItem(`cooldown:${key}`);
  return v ? Number(v) : 0;
}
export function markTime(key: string) {
  if (typeof window==='undefined') return;
  window.localStorage.setItem(`cooldown:${key}`, String(Date.now()));
}

export function appendLedger(entry: {
  date: string; mission: string; type: 'daily'|'weekly'|'monthly';
  stable: number; edge: number; note?: string; lock_until?: string; proof_url?: string;
}) {
  const raw = readCsvLS('ledger') || 'date,quest_id,type,stable_amt,edge_amt,lock_until,proof_url,note\n';
  const rows = parseCsv(raw);
  const line = [
    entry.date,
    entry.mission,
    entry.type,
    String(Math.round(entry.stable)),
    String(Math.round(entry.edge)),
    entry.lock_until||'',
    entry.proof_url||'',
    entry.note||''
  ].join(',');
  const next = raw.trimEnd() + '\n' + line + '\n';
  writeCsvLS('ledger', next);
}
