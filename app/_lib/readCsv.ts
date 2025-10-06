// app/_lib/readCsv.ts
import { CsvRows, DatasetKey, requiredHeaders } from './contracts';

// ── 로컬스토리지 키 규칙
const tsKey = (k: DatasetKey) => `${k}__ts`;

// ── 로컬스토리지 IO
export function readCsvLS(key: DatasetKey): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

export function writeCsvLS(key: DatasetKey, csv: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, csv);
  localStorage.setItem(tsKey(key), String(Date.now()));
}

export function clearCsvLS(key: DatasetKey): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
  localStorage.removeItem(tsKey(key));
}

export function lastSavedAt(key: DatasetKey): number {
  if (typeof window === 'undefined') return 0;
  const v = localStorage.getItem(tsKey(key));
  return v ? Number(v) : 0;
}

// ── 아주 간단한 CSV 파서(따옴표 없는 형태 가정)
export function parseCsv(csv: string): CsvRows {
  if (!csv.trim()) return [];
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(s => s.trim());
  const rows: CsvRows = [];
  for (let i=1;i<lines.length;i++){
    const cols = lines[i].split(',');
    const r: Record<string,string> = {};
    headers.forEach((h,idx)=> r[h] = (cols[idx] ?? '').trim());
    rows.push(r);
  }
  return rows;
}

// ── 헤더 검증
export function validateHeaders(csv: string, key: DatasetKey): { ok: boolean; missing: string[] } {
  const need = requiredHeaders[key] || [];
  const first = csv.split(/\r?\n/)[0] || '';
  const have = first.split(',').map(s=>s.trim());
  const missing = need.filter(h => !have.includes(h));
  return { ok: missing.length === 0, missing };
}

export { requiredHeaders } from './contracts';
export type { DatasetKey, CsvRows } from './contracts';
export { datasetKeys } from './contracts';
