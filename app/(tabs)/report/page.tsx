'use client'
import React, {useMemo} from 'react'
import { readCsvLS, parseCsv, type CsvRows } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'

// (옵션) 버튼/배지 스타일은 공통 CSS로 이미 적용되어 있다는 가정

export default function Report(){
  // 로컬스토리지에서 kpi_daily CSV 불러오기
  const raw = readCsvLS('kpi_daily') || ''

  // 항상 {headers, rows} 형태로 맞춤
  const data: CsvRows = useMemo(
    () => (raw ? parseCsv(raw) : { headers: [], rows: [] }),
    [raw]
  )
  const rows = data.rows

  // 합계 계산
  let visits=0, clicks=0, orders=0, revenue=0, adCost=0, returns=0, reviews=0
  for (const r of rows) {
    visits  += num(r.visits)
    clicks  += num(r.clicks)
    orders  += num(r.orders)
    revenue += num(r.revenue)
    adCost  += num(r.ad_cost)
    returns += num(r.returns)
    reviews += num(r.reviews)
  }

  const ROAS = adCost ? revenue/adCost : 0
  const CR   = visits ? orders/visits : 0
  const AOV  = orders ? revenue/orders : 0
  const RetR = orders ? returns/orders : 0

  return (
    <div className="page">
      <h1>Command Center (C0)</h1>

      <div className="kpi-grid">
        <KpiTile label="매출" value={fmt(revenue)} />
        <KpiTile label="ROAS" value={pct(ROAS)} />
        <KpiTile label="CR"   value={pct(CR)} />
        <KpiTile label="AOV"  value={fmt(AOV)} />
        <KpiTile label="반품률" value={pct(RetR)} />
        <KpiTile label="리뷰" value={fmt(reviews)} />
      </div>

      <div className="table-wrap" style={{maxHeight:480, overflow:'auto'}}>
        <table className="table">
          <thead>
            <tr>
              <th>date</th><th>channel</th><th>visits</th><th>clicks</th>
              <th>orders</th><th>revenue</th><th>ad_cost</th>
              <th>returns</th><th>reviews</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i)=>(
              <tr key={i}>
                <td>{r.date}</td>
                <td>{r.channel}</td>
                <td>{r.visits}</td>
                <td>{r.clicks}</td>
                <td>{r.orders}</td>
                <td>{r.revenue}</td>
                <td>{r.ad_cost}</td>
                <td>{r.returns}</td>
                <td>{r.reviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KpiTile({label, value}:{label:string; value:string}){
  return (
    <div className="kpi-tile">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  )
}
