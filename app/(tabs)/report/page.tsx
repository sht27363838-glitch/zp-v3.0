'use client'

import { sourceTag } from '@lib/csvSafe'
import React, {useMemo} from 'react'
import { readCsvOrDemo } from '@lib/csvSafe'
import { parseCsv, type CsvRow } from '@lib/readCsv'
import { validate } from '@lib/csvSafe'
import { num, fmt } from '@lib/num'
import KpiTile from '@cmp/KpiTile'
import ScrollWrap from '@cmp/ScrollWrap'
import ErrorBanner from '@cmp/ErrorBanner'
import Pager from '@cmp/Pager'

const pct1 = (v:number)=> `${(v*100).toFixed(1)}%`

function readLastMonthProfit(): number {
  const raw = readCsvOrDemo('settings') || ''
  if(!raw) return 1_000_000
  try{
    const rows = parseCsv(raw).rows as any[]
    const p = Number(rows?.[0]?.last_month_profit ?? 0)
    return isFinite(p)&&p>0 ? p : 1_000_000
  }catch{ return 1_000_000 }
}

export default function ReportPage(){
  const raw = readCsvOrDemo('kpi_daily')
  const data = useMemo(()=> parseCsv(raw), [raw])
  const check = validate('kpi_daily', data)

  let visits=0, clicks=0, orders=0, revenue=0, adCost=0, returns=0
  for(const r of data.rows as CsvRow[]){
    visits+=num(r.visits); clicks+=num(r.clicks); orders+=num(r.orders)
    revenue+=num(r.revenue); adCost+=num(r.ad_cost); returns+=num(r.returns)
  }
  const ROAS = adCost? revenue/adCost : 0
  const CR   = visits? orders/visits : 0
  const AOV  = orders? revenue/orders : 0
  const returnsRate = orders? returns/orders : 0
  const lastMonthProfit = readLastMonthProfit()

  return (
    <div className="page">
      <div style={{display:'flex', alignItems:'center', gap:8}}>
  <h1>지휘소(C0) — 요약</h1>
  <span className="badge">{sourceTag('kpi_daily')}</span>
</div>

      {!check.ok && (
        <ErrorBanner tone="warn" title="CSV 스키마 누락"
          message={`필수 컬럼이 없습니다: ${check.missing.join(', ')}`} show />
      )}

      <div className="kpi-grid">
        <KpiTile label="매출" value={fmt(revenue)} />
        <KpiTile label="ROAS" value={pct1(ROAS)} />
        <KpiTile label="전환율" value={pct1(CR)} />
        <KpiTile label="AOV" value={fmt(AOV)} />
        <KpiTile label="반품률" value={pct1(returnsRate)} />
        <KpiTile label="전월 순익(기준)" value={fmt(lastMonthProfit)} />
      </div>

      {data.rows.length===0 ? (
        <div className="skeleton" />
      ) : (
        <div style={{marginTop:16}}>
          <h2 className="mb-2">최근 지표 표</h2>
          <Pager data={(data.rows as CsvRow[]).slice().reverse()} pageSize={50}
            render={(page)=>(
              <ScrollWrap>
                <table className="table">
                  <thead>
                    <tr>
                      <th>날짜</th><th>채널</th><th>방문</th><th>클릭</th>
                      <th>주문</th><th>매출</th><th>광고비</th><th>반품</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.map((r,i)=>(
                      <tr key={i}>
                        <td>{String(r.date||'')}</td>
                        <td>{String(r.channel||'')}</td>
                        <td>{fmt(r.visits)}</td>
                        <td>{fmt(r.clicks)}</td>
                        <td>{fmt(r.orders)}</td>
                        <td>{fmt(r.revenue)}</td>
                        <td>{fmt(r.ad_cost)}</td>
                        <td>{fmt(r.returns)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollWrap>
            )}
          />
        </div>
      )}

      <div style={{marginTop:16, opacity:.8}}>
        <p className="text-sm">데이터 원본: <code>kpi_daily.csv</code></p>
      </div>
    </div>
  )
}
