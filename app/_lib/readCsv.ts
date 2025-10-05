/**
 * CSV helpers for client-only usage (localStorage-backed).
 * Keys are stored as `csv:<name>` (e.g., csv:kpi_daily, csv:ledger).
 */

export function readCsvFromLocal(name: string): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(`csv:${name}`) || '';
}

export function writeCsvToLocal(name: string, csv: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`csv:${name}`, csv);
}

export function parseCsv(csv: string): Array<Record<string, string>> {
  if (!csv) return [];
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h=>h.trim());
  const rows: Array<Record<string,string>> = [];
  for (let i=1; i<lines.length; i++) {
    const cols = lines[i].split(','); // simple CSV (no quoted commas)
    const r: Record<string,string> = {};
    for (let j=0; j<headers.length; j++) {
      r[headers[j]] = (cols[j] ?? '').trim();
    }
    rows.push(r);
  }
  return rows;
}
