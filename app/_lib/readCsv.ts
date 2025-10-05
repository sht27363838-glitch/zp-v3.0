// app/_lib/readCsv.ts
export type CsvRow = Record<string, string>;
export type CsvRows = CsvRow[];

/** 매우 단순한 CSV 파서: 헤더 1행 기준, 콤마 구분 */
export function parseCsv(raw: string): CsvRows {
  if (!raw) return [];
  const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);
  if (lines.length === 0) return [];
  const headers = splitLine(lines[0]);
  const rows: CsvRows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((h, idx) => (row[h] = (cols[idx] ?? "").trim()));
    rows.push(row);
  }
  return rows;
}

function splitLine(line: string): string[] {
  // 아주 단순한 스플리터(따옴표 처리 최소): "a,b",c → 처리
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/** LocalStorage에서 CSV 원문을 불러온다(클라이언트 전용). 없으면 빈 문자열 */
export function readCsvLS(key: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
}

/** LocalStorage에 CSV 원문을 저장(클라이언트 전용) */
export function writeCsvLS(key: string, raw: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, raw || "");
}

/** 과거 호환 alias */
export const readCsvFromLocal = readCsvLS;
export const writeCsvToLocal = writeCsvLS;
