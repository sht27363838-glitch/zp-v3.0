'use client'

import React, { useMemo } from 'react'
import { readCsvLS, parseCsv, type CsvRow } from '../../_lib/readCsv'
import { num, fmt, pct } from '../../_lib/num'
import KpiTile from '../../_components/KpiTile'

// settings.csv에서 last_month_profit 불러오기 (없으면 기본값)
function readLastMonthProfit(): number {
  const raw = readCsvLS('settings') || ''
  if (!raw) return 1_000_000
  const data = parseCsv(raw)
  const row = (data.rows?.[0] as any) || {}
  const p = Number(row.last_month_profit ?? 0)
  return isFinite(p) && p > 0 ? p : 1_000_000
}

export default function ReportPage() {
  // 원시 CSV 로드
  const raw = readCsvLS('kpi_daily') || ''

  // 한 번만 파싱
  const data = useMemo(
    () => (raw ? parseCsv(raw) : { headers: [] as string[], rows: [] as CsvRow[] }),
    [raw]
  )

  // 합계 계산(헤더 한/영 혼용 대응)
  let visits = 0,
    clicks = 0,
    orders = 0,
    revenue = 0,
    adCost = 0,
    returns = 0

  for (const r of data.rows) {
    visits += num(r.visits)
    clicks += num(r.clicks)
    orders += num(r.orders)
    revenue += num(r.revenue)
    adCost += num(r.ad_cost)
    returns += num(r.returns)
  }

  const ROAS = adCost ? revenue / adCost : 0
  const CR = visits ? orders / visits : 0
  const AOV = orders ? revenue / orders : 0
  const returnsRate = orders ? returns / orders : 0

  const lastMonthProfit = readLastMonthProfit()

  // 퍼센트 문자열(소수 1자리) 강제 헬퍼
  const pct1 = (v: number) => pct(v, 1) // string 반환

  return (
    <div className="page">
      <h1>지휘소(C0) — 요약</h1>

      <div className="kpi-grid">
        <KpiTile label="매출" value={fmt(revenue)} />
        <KpiTile label="ROAS" value={pct1(ROAS)} />
        <KpiTile label="전환율" value={pct1(CR)} />
        <KpiTile label="AOV" value={fmt(AOV)} />
        <KpiTile label="반품률" value={pct1(returnsRate)} />
        <KpiTile label="전월 순익(기준)" value={fmt(lastMonthProfit)} />
      </div>

      <div style={{ marginTop: 16, opacity: 0.8 }}>
        <p className="text-sm">
          데이터 원본: <code>kpi_daily.csv</code>, 기준 순익:{' '}
          <code>settings.csv</code> (<code>last_month_profit</code>)
        </p>
      </div>
    </div>
  )
}
