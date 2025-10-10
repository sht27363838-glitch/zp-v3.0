// app/(tabs)/report/page.tsx
'use client'

import React, { useMemo } from 'react'
import { readCsvLS, parseCsv, type CsvRow } from '../../_lib/readCsv'
import { num, fmt } from '../../_lib/num'
import KpiTile from '../../_components/KpiTile'
import ScrollWrap from '../../_components/ScrollWrap' // ✅ 추가
import ErrorBanner from '../../_components/ErrorBanner'
import DownloadCsv from '../../_components/DownloadCsv'


// 퍼센트 문자열을 보장하는 로컬 헬퍼(항상 string 반환)
const pct1 = (v: number): string => `${(v * 100).toFixed(1)}%`

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

  // 한 번만 파싱해 {headers, rows} 형태로 강제
  const data = useMemo(
    () => (raw ? parseCsv(raw) : { headers: [] as string[], rows: [] as CsvRow[] }),
    [raw]
  )

  // 합계 계산
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

  return (
    <div className="page">
      <h1>지휘소(C0) — 요약</h1>

      {/* ✅ 1) KPI 그리드 (기존 그대로) */}
      <div className="kpi-grid">
        <KpiTile label="매출" value={fmt(revenue)} />
        <KpiTile label="ROAS" value={pct1(ROAS)} />
        <KpiTile label="전환율" value={pct1(CR)} />
        <KpiTile label="AOV" value={fmt(AOV)} />
        <KpiTile label="반품률" value={pct1(returnsRate)} />
        <KpiTile label="전월 순익(기준)" value={fmt(lastMonthProfit)} />
      </div>
      {data.rows.length === 0 && (
  <ErrorBanner tone="info" title="데이터 없음"
    message="Tools에서 데모 CSV를 업로드하거나 kpi_daily.csv를 넣어주세요." />
)}


      {/* ⬇️⬇️⬇️ ✅ 2) 여기가 ‘정확히’ 붙일 자리입니다 ⬇️⬇️⬇️ */}
      {data.rows.length === 0 ? (
        <div className="skeleton" />
      ) : (
        <div style={{ marginTop: 16 }}>
          <h2 className="mb-2">최근 지표 표</h2>
          <ScrollWrap>
            <table className="table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>채널</th>
                  <th>방문</th>
                  <th>클릭</th>
                  <th>주문</th>
                  <th>매출</th>
                  <th>광고비</th>
                  <th>반품</th>
                </tr>
              </thead>
              <tbody>
                {(data.rows as CsvRow[]).slice(-20).reverse().map((r, i) => (
                  <tr key={i}>
                    <td>{String(r.date ?? '')}</td>
                    <td>{String(r.channel ?? '')}</td>
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
        </div>
      )}
      {/* ⬆️⬆️⬆️ 여기까지 표 블록 ⬆️⬆️⬆️ */}

      {/* ✅ 3) 기존 설명 문단 — 표 블록 ‘아래’에 그대로 유지 */}
      <div className="row" style={{gap:8, marginTop:16}}>
  <DownloadCsv keyName="kpi_daily" label="kpi_daily.csv 다운로드"/>
  <DownloadCsv keyName="settings"  label="settings.csv 다운로드"/>
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
