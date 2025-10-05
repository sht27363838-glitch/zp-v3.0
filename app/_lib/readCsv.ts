'use client';

export type Row = Record<string, string | number>;
const KEY = (name: string) => `csv:${name}`;

/** CSV 텍스트 → 객체 배열 */
export function parseCsv(csvText: string): Row[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(s => s.trim());
  return lines.slice(1).filter(Boolean).map(line => {
    const cells = line.split(',').map(s => s.trim());
    const obj: Row = {};
    headers.forEach((h, i) => obj[h] = cells[i] ?? '');
    return obj;
  });
}

/** 객체 배열 → CSV 텍스트 */
export function toCsv(rows: Row[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const body = rows.map(r => headers.map(h => (r[h] ?? '')).join(',')).join('\n');
  return `${headers.join(',')}\n${body}`;
}

/** 로컬스토리지에 CSV 텍스트 저장 */
export function saveCsv(name: string, csvText: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY(name), csvText);
}

/** 로컬스토리지에서 CSV 읽어 파싱 */
export function readCsvFromLocal(name: string): Row[] {
  if (typeof window === 'undefined') return [];
  const txt = localStorage.getItem(KEY(name)) || '';
  try { return txt ? parseCsv(txt) : []; } catch { return []; }
}

/** 샘플 템플릿(헤더만) 제공 */
export function sampleTemplate(name: string): string {
  const templates: Record<string, string> = {
    kpi_daily: 'date,channel,visits,clicks,carts,orders,revenue,ad_cost,returns,reviews\n',
    creative_results: 'date,creative_id,impressions,clicks,spend,orders,revenue\n',
    ledger: 'date,quest_id,type,stable_amt,edge_amt,lock_until,proof_url\n',
  };
  return templates[name] ?? '';
}
