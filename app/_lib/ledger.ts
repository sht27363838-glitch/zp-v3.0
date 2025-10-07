// app/_lib/ledger.ts
import { CsvTable, parseCsv, toCsv, readCsvLS, writeCsvLS } from './readCsv';
import { num } from './num';

export type LedgerRow = {
  date: string;             // YYYY-MM-DD
  mission: string;          // e.g., "Daily Loop"
  type: string;             // daily/weekly/monthly/…
  stable: number;
  edge: number;
  note: string;             // 'EDGE LOCK' / 'PAYOUT CUT' 등
  lock_until: string;       // '' or YYYY-MM-DD
};

const KEY: 'ledger' = 'ledger';

export function readLedger(): CsvTable {
  const raw = readCsvLS(KEY) || '';
  if (!raw) return { headers: ['date','mission','type','stable','edge','note','lock_until'], rows: [] };
  return parseCsv(raw);
}

export function appendLedger(row: LedgerRow) {
  const table = readLedger();
  // 헤더 보정
  if (table.headers.length === 0)
    table.headers = ['date','mission','type','stable','edge','note','lock_until'];
  table.rows.push({
    date: row.date,
    mission: row.mission,
    type: row.type,
    stable: num(row.stable),
    edge: num(row.edge),
    note: row.note || '',
    lock_until: row.lock_until || '',
  });
  writeCsvLS(KEY, toCsv(table));
}

const TS_PREFIX = 'zp3.cooldown.';
export const lastTimeKey = (k: string): number => {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(TS_PREFIX + k) || 0);
};
export const markTime = (k: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TS_PREFIX + k, String(Date.now()));
};
