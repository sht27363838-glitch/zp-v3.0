'use client'
export type Row = Record<string, string|number|undefined>;

export function readCsvLS(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

export function writeCsvLS(key: string, csv: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, csv);
}

export function parseCsv(csv: string): Row[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(s=>s.trim());
  return lines.slice(1).filter(Boolean).map(line=>{
    const cols = line.split(',').map(s=>s.trim());
    const row: Row = {};
    headers.forEach((h, i)=> row[h] = cols[i] ?? '');
    return row;
  });
}
