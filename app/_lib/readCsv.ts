// app/_lib/readCsv.ts
export type CsvRow = Record<string, string>;
export type CsvRows = CsvRow[];

const LS_PREFIX = 'csv::';

export const datasetKeys = ['kpi_daily','ledger','creative_results'] as const;
export type DatasetKey = typeof datasetKeys[number];

export const requiredHeaders: Record<DatasetKey, string[]> = {
  kpi_daily: ['date','channel','visits','clicks','carts','orders','revenue','ad_cost','returns','reviews'],
  ledger: ['date','mission','type','locked','vested','unlock_end','status'],
  creative_results: ['date','channel','adset','creative','spend','impressions','clicks','orders','revenue'],
};

export function readCsvLS(key: DatasetKey): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LS_PREFIX + key);
}
export function writeCsvLS(key: DatasetKey, csv: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_PREFIX + key, csv);
  window.localStorage.setItem(LS_PREFIX + key + '::ts', String(Date.now()));
}
export function clearCsvLS(key: DatasetKey) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LS_PREFIX + key);
  window.localStorage.removeItem(LS_PREFIX + key + '::ts');
}
export function lastSavedAt(key: DatasetKey): number | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(LS_PREFIX + key + '::ts');
  return v ? Number(v) : null;
}

export function parseCsv(csv: string): CsvRows {
  const lines = csv.split(/\r?\n/).filter(l=>l.trim().length>0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h=>h.trim());
  return lines.slice(1).map(line=>{
    const cols = splitCsvLine(line);
    const row: CsvRow = {};
    headers.forEach((h,i)=> row[h] = (cols[i] ?? '').trim());
    return row;
  });
}
function splitCsvLine(line: string): string[] {
  // 단순 CSV 파서(따옴표 포함)
  const out: string[] = [];
  let cur = '', quoted = false;
  for (let i=0;i<line.length;i++){
    const ch = line[i];
    if (ch === '"'){
      if (quoted && line[i+1] === '"'){ cur += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted){
      out.push(cur); cur='';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export function validateHeaders(csv: string, dataset: DatasetKey): {ok:boolean; missing:string[]; present:string[]}{
  const rows = csv.trim() ? csv.split(/\r?\n/) : [];
  if (rows.length === 0) return { ok:false, missing: requiredHeaders[dataset], present: [] };
  const head = rows[0].split(',').map(s=>s.trim().toLowerCase());
  const need = requiredHeaders[dataset];
  const missing = need.filter(h=>!head.includes(h));
  const present = head;
  return { ok: missing.length===0, missing, present };
}
