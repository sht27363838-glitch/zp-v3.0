// app/_lib/ledger.ts
import { readCsvLS, writeCsvLS } from './readCsv';

type NewLedgerRow = {
  date: string;
  mission: string;
  type: 'daily'|'weekly'|'monthly';
  stable: number;
  edge: number;
  note?: string;
  lock_until?: string;
};

export function appendLedger(row: NewLedgerRow){
  if (typeof window === 'undefined') return;
  const key = 'ledger';
  const prev = readCsvLS(key as any) || 'date,mission,type,stable,edge,note,lock_until';
  const line = [
    row.date,
    row.mission,
    row.type,
    String(row.stable ?? 0),
    String(row.edge ?? 0),
    (row.note ?? '').replace(/,/g,' '),
    (row.lock_until ?? '')
  ].join(',');
  const next = prev.trim() + '\n' + line;
  writeCsvLS(key as any, next);
}

// 쿨다운(시간키) 유틸
export function lastTimeKey(key: string): number {
  if (typeof window === 'undefined') return 0;
  const v = localStorage.getItem(`ts::${key}`);
  return v? Number(v): 0;
}

export function markTime(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`ts::${key}`, String(Date.now()));
}
