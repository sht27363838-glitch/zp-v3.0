'use client'

// Lightweight CSV helpers backed by localStorage
// Keys look like: 'csv:ledger', 'csv:kpi_daily', etc.

export type CsvRows = Array<Record<string, string>>;

export function parseCsv(text: string): CsvRows {
  if (!text || !text.trim()) return [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]);
  const rows: CsvRows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) {
      row[header[c]] = (cols[c] ?? '').trim();
    }
    rows.push(row);
  }
  return rows;
}

// Simple CSV line splitter supporting basic quoted fields
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { // escaped quote
        cur += '"'; i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function readCsvFromLocal(name: string): { raw: string; rows: CsvRows } {
  if (typeof window === 'undefined') return { raw: '', rows: [] };
  const key = 'csv:' + name;
  const raw = window.localStorage.getItem(key) || '';
  const rows = parseCsv(raw);
  return { raw, rows };
}

export function writeCsvToLocal(name: string, raw: string): void {
  if (typeof window === 'undefined') return;
  const key = 'csv:' + name;
  window.localStorage.setItem(key, raw);
}

// ---- Compatibility aliases (so existing pages keep working) ----
export const readCsvLS = readCsvFromLocal;
export const writeCsvLS = writeCsvToLocal;
