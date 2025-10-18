import { parseCsv, toCsv, type CsvTable } from '@lib/readCsv'

export function migrateKpi(raw:string): string {
  // 헤더 버전 탐지(없으면 v1 가정)
  const table = parseCsv(raw)
  const head = table.headers
  // v1→v2 예: carts/reviews 컬럼이 없으면 추가
  const need = ['carts','reviews']
  const missing = need.filter(h=> !head.includes(h))
  if (missing.length===0) return raw

  const headers = [...head, ...missing]
  const rows = (table.rows as any[]).map(r=>{
    const o:any = {...r}
    if(!('carts' in o)) o.carts = 0
    if(!('reviews' in o)) o.reviews = 0
    return o
  })
  return toCsv({ headers, rows } as CsvTable)
}
