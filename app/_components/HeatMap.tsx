'use client'
import React from 'react'

type Row = {
  date?: string
  channel?: string
  product?: string
  visits?: number
  clicks?: number
  orders?: number
  ad_cost?: number
}

type Props = {
  /** 원본 행들 */
  rows: Row[]
  /** X축 키 (기본: channel) */
  xKey?: keyof Row
  /** Y축 키 (기본: product) */
  yKey?: keyof Row
  /** 셀 클릭 시 콜백 */
  onCellClick?: (info: {
    x: string
    y: string
    clicks: number
    orders: number
    visits: number
    ad_cost: number
    cr: number
  }) => void
  /** 테이블 className (기본: 'table') */
  className?: string
}

/**
 * 채널×상품 히트맵
 * - O(N) 1-pass 집계 (key = `${y}|${x}`)
 * - 셀 색상은 CR 기반 alpha
 */
export default function HeatMap({
  rows,
  xKey = 'channel',
  yKey = 'product',
  onCellClick,
  className = 'table',
}: Props) {
  // 축 라벨 수집
  const xcats = React.useMemo(() => {
    const s = new Set<string>()
    for (const r of rows) s.add(String((r as any)[xKey] ?? 'unknown'))
    return Array.from(s).sort()
  }, [rows, xKey])

  const ycats = React.useMemo(() => {
    const s = new Set<string>()
    for (const r of rows) s.add(String((r as any)[yKey] ?? 'generic'))
    return Array.from(s).sort()
  }, [rows, yKey])

  // 1-pass 집계
  const agg = React.useMemo(() => {
    type Cell = { visits: number; clicks: number; orders: number; ad_cost: number }
    const m = new Map<string, Cell>()
    for (const r of rows) {
      const x = String((r as any)[xKey] ?? 'unknown')
      const y = String((r as any)[yKey] ?? 'generic')
      const k = `${y}|${x}`
      const o = m.get(k) ?? { visits: 0, clicks: 0, orders: 0, ad_cost: 0 }
      o.visits += Number(r.visits ?? 0)
      o.clicks += Number(r.clicks ?? 0)
      o.orders += Number(r.orders ?? 0)
      o.ad_cost += Number(r.ad_cost ?? 0)
      m.set(k, o)
    }
    return m
  }, [rows, xKey, yKey])

  function cell(x: string, y: string) {
    const k = `${y}|${x}`
    const o = agg.get(k) ?? { visits: 0, clicks: 0, orders: 0, ad_cost: 0 }
    const cr = o.clicks ? o.orders / Math.max(1, o.clicks) : 0
    return { ...o, cr }
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="scroll">
        <table className={className} style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>{String(yKey)} \ {String(xKey)}</th>
              {xcats.map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ycats.map((y) => (
              <tr key={y}>
                <td><b>{y}</b></td>
                {xcats.map((x) => {
                  const v = cell(x, y)
                  const heat = Math.min(1, v.cr * 3) // CR 기반 단순 강도
                  return (
                    <td key={x}>
                      <button
                        className="cell"
                        onClick={() => onCellClick?.({ x, y, ...v })}
                        aria-label={`CR ${(v.cr * 100).toFixed(1)}% / 주문 ${fmt(v.orders)} / 클릭 ${fmt(v.clicks)}`}
                        style={{
                          width: '100%',
                          padding: 8,
                          background: `rgba(79,227,193,${0.08 + 0.35 * heat})`,
                          borderRadius: 8,
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {(v.cr * 100).toFixed(1)}%
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ====== 작은 유틸 ======
function fmt(v: any) {
  const n = Number(v ?? 0)
  return isFinite(n) ? n.toLocaleString('ko-KR') : '0'
}

