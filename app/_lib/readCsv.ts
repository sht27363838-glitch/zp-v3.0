// app/_lib/readCsv.ts
export type CsvRows = Array<Record<string,string>>

export function readCsvLS(key: string): string {
  if (typeof window === 'undefined') return ''    // ✅ SSR/빌드 가드
  try { return localStorage.getItem(key) || '' } catch { return '' }
}

export function writeCsvLS(key: string, raw: string) {
  if (typeof window === 'undefined') return       // ✅ SSR/빌드 가드
  try { localStorage.setItem(key, raw) } catch {}
}

export function parseCsv(raw: string): CsvRows {
  if (!raw) return []
  const [head, ...lines] = raw.split(/\r?\n/).filter(Boolean)
  if (!head) return []
  const cols = head.split(',').map(s=>s.trim())
  return lines.map(line=>{
    const cells = line.split(','); const row: Record<string,string> = {}
    cols.forEach((c,i)=> row[c] = (cells[i]??'').trim())
    return row
  })
}
