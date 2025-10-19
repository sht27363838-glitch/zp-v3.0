// app/(tabs)/commerce/page.tsx
'use client'

import React, { useMemo, useState, useDeferredValue } from 'react'
import { readCsvOrDemo, parseCsv, type CsvRow } from '@lib/readCsv'
import { num, fmt, pct } from '@lib/num'
import ErrorBanner from '@cmp/ErrorBanner'
import ExportBar from '@cmp/ExportBar'
import useIdle from '@lib/useIdle'
import HeatMap from '@cmp/HeatMap'

type Row = {
  date?: string
  channel?: string
  product?: string
  visits?: number
  clicks?: number
  orders?: number
  ad_cost?: number
}

export default function CommercePage() {
  // 1) 데이터 로드
  const raw = readCsvOrDemo('kpi_daily')
  const data = useMemo(() => (raw ? parseCsv(raw) : { headers: [], rows: [] }), [raw])

  // 2) 행 정규화
  const rows: Row[] = useMemo(() => {
    return (data.rows as CsvRow[]).map(r => ({
      date: String(r.date ?? ''),
      channel: String(r.channel ?? 'unknown'),
      product: String((r as any).product ?? (r as any).sku ?? 'generic'),
      visits: num(r.visits),
      clicks: num(r.clicks),
      orders: num(r.orders),
      ad_cost: num(r.ad_cost),
    }))
  }, [data.rows])

  // 3) 성능: idle/deferred
  const idleReady = useIdle(500)
  const deferredRows = useDeferredValue(rows)

  // 4) 모달 포커스 상태
  const [focus, setFocus] = useState<{
    x: string; y: string; clicks: number; orders: number; visits: number; ad_cost: number; cr: number;
  } | null>(null)

  return (
    <div className="page">
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <h1>C2 — 전환/커머스 레이더</h1>
        <ExportBar selector="#commerce-heat" />
      </div>

      {/* 데이터 없음/에러 가드 */}
      {deferredRows.length === 0 ? (
        <>
          <div className="skeleton" />
          <ErrorBanner
            tone="info"
            title="데이터 없음"
            message="kpi_daily.csv가 비어 있습니다. Tools 탭에서 데모 업로드 후 확인하세요."
            show
          />
        </>
      ) : (
        <div id="commerce-heat" style={{marginTop:12}}>
          {!idleReady ? (
            <div className="skeleton" style={{height:260}} />
          ) : (
            <HeatMap
              rows={deferredRows}
              xKey="channel"     // X축: 채널
              yKey="product"     // Y축: 상품/SKU
              className="table"
              onCellClick={(info) => setFocus(info)}  // 셀 클릭 시 모달 열기
            />
          )}
        </div>
      )}

      {/* 상세 모달 */}
      {focus && (
        <div className="modal" onClick={()=>setFocus(null)}>
          <div className="modal-body" onClick={e=>e.stopPropagation()}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <b>{focus.y} / {focus.x}</b>
              <button className="btn" onClick={()=>setFocus(null)}>닫기</button>
            </div>

            <div className="row" style={{gap:16, marginTop:12}}>
              <div className="card" style={{flex:1}}>
                <div className="muted" style={{fontSize:12, marginBottom:6}}>CR</div>
                <div style={{fontWeight:700}}>{pct(focus.cr)}</div>
              </div>
              <div className="card" style={{flex:1}}>
                <div className="muted" style={{fontSize:12, marginBottom:6}}>클릭</div>
                <div style={{fontWeight:700}}>{fmt(focus.clicks)}</div>
              </div>
              <div className="card" style={{flex:1}}>
                <div className="muted" style={{fontSize:12, marginBottom:6}}>주문</div>
                <div style={{fontWeight:700}}>{fmt(focus.orders)}</div>
              </div>
              <div className="card" style={{flex:1}}>
                <div className="muted" style={{fontSize:12, marginBottom:6}}>방문</div>
                <div style={{fontWeight:700}}>{fmt(focus.visits)}</div>
              </div>
              <div className="card" style={{flex:1}}>
                <div className="muted" style={{fontSize:12, marginBottom:6}}>광고비</div>
                <div style={{fontWeight:700}}>{fmt(focus.ad_cost)}</div>
              </div>
            </div>

            <p className="muted" style={{marginTop:8}}>
              선택: <b>{focus.y}</b> × <b>{focus.x}</b> — 클릭하면 닫힙니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

