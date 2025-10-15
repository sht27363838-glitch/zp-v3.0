// app/(tabs)/report/page.tsx
'use client'

import React, { useMemo } from 'react'
import { sourceTag, readCsvOrDemo, validate } from '@lib/csvSafe'
import { parseCsv, type CsvRow } from '@lib/readCsv'
import { num, fmt } from '@lib/num'
import KpiTile from '@cmp/KpiTile'
import ErrorBanner from '@cmp/ErrorBanner'
import ExportBar from '@cmp/ExportBar'
import VirtualTable from '@cmp/VirtualTable'

const pct1 = (v: number) => `${(v * 100).toFixed(1)}%`

function readLastMonthProfit(): number {
  const raw = readCsvOrDemo('settings') || ''
  if (!raw) return 1_000_000
  try {
    const rows = parseCsv(raw).rows as any[]
    const p = Number(rows?.[0]?.last_month_profit ?? 0)
    return isFinite(p) && p > 0 ? p : 1_000_000
  } catch {
    return 1_000_000
  }
}

export default function ReportPage() {
  // ✅ 데모/로컬 자동 대체
  const raw = readCsvOrDemo('kpi_daily')
  const data = useMemo(() => parseCsv(raw), [raw])
  const check = validate('kpi_daily', data)

  // 합계
  let visits = 0,
    clicks = 0,
    orders = 0,
    revenue = 0,
    adCost = 0,
    returns = 0
  for (const r of data.rows as CsvRow[]) {
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
      {/* 제목 + 전체 KPI 캡처용 ExportBar + 데이터 소스 배지 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h1>지휘소(C0) — 요약</h1>
        <ExportBar selector=".kpi-grid" />
        <span className="badge">{sourceTag('kpi_daily')}</span>
      </div>

      {/* 스키마 검증 결과(누락 컬럼 안내) */}
      {!check.ok && (
        <ErrorBanner
          tone="warn"
          title="CSV 스키마 누락"
          message={`필수 컬럼이 없습니다: ${check.missing.join(', ')}`}
          show
        />
      )}

      {/* KPI 그리드 */}
      <div className="kpi-grid">
        <KpiTile label="매출" value={fmt(revenue)} />
        <KpiTile label="ROAS" value={pct1(ROAS)} />
        <KpiTile label="전환율" value={pct1(CR)} />
        <KpiTile label="AOV" value={fmt(AOV)} />
        <KpiTile label="반품률" value={pct1(returnsRate)} />
        <KpiTile label="전월 순익(기준)" value={fmt(lastMonthProfit)} />
      </div>

      {/* 표 섹션: VirtualTable + 표 전용 ExportBar */}
      <h2 className="mb-2" style={{ marginTop: 16 }}>
        최근 지표 표
      </h2>
      <ExportBar selector="#report-table" /> {/* ✅ 표만 내보내기 */}

      {data.rows.length === 0 ? (
        <div className="skeleton" />
      ) : (
        <div id="report-table">
          <VirtualTable
            className="table"
            rows={(data.rows as CsvRow[]).slice(-500).reverse()} // 최근 500건 (최신 우선)
            // height/rowHeight 제거(컴포넌트 API 차이로 빌드 에러 방지)
            header={
              <>
                {/* 🔒 열 폭/정렬 고정 */}
                <colgroup>
                  <col className="min" />   {/* 날짜 */}
                  <col className="min" />   {/* 채널 */}
                  <col />                   {/* 방문 */}
                  <col />                   {/* 클릭 */}
                  <col />                   {/* 주문 */}
                  <col className="wide" />  {/* 매출 */}
                  <col className="wide" />  {/* 광고비 */}
                  <col />                   {/* 반품 */}
                </colgroup>
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>채널</th>
                    <th className="num">방문</th>
                    <th className="num">클릭</th>
                    <th className="num">주문</th>
                    <th className="num">매출</th>
                    <th className="num">광고비</th>
                    <th className="num">반품</th>
                  </tr>
                </thead>
              </>
            }
            rowKey={(r) =>
              `${String(r.date ?? '')}-${String(r.channel ?? '')}-${String(r.orders ?? '')}-${String(
                r.revenue ?? ''
              )}`
            }
            renderRow={(r: CsvRow) => (
              <tr>
                <td>{String(r.date ?? '')}</td>
                <td>{String(r.channel ?? '')}</td>
                <td className="num">{fmt(r.visits)}</td>
                <td className="num">{fmt(r.clicks)}</td>
                <td className="num">{fmt(r.orders)}</td>
                <td className="num">{fmt(r.revenue)}</td>
                <td className="num">{fmt(r.ad_cost)}</td>
                <td className="num">{fmt(r.returns)}</td>
              </tr>
            )}
          />
        </div>
      )}

      <div style={{ marginTop: 16, opacity: 0.8 }}>
        <p className="text-sm">
          데이터 원본: <code>kpi_daily.csv</code>
        </p>
      </div>
    </div>
  )
}
