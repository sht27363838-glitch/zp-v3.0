// app/_components/HeatMap.tsx
'use client'

import React, { useState } from 'react'
import { fmt, pct } from '../_lib/num'
import Spark from './Spark'

type Cell = {
  product: string
  source: string
  cr: number
  orders: number
  clicks: number
  series: number[]
}

export default function HeatMap({ cells }: { cells: Cell[] }) {
  const [pick, setPick] = useState<Cell | null>(null)
  const [hover, setHover] = useState<number | null>(null)

  const open = (c: Cell) => setPick(c)
  const close = () => setPick(null)

  // RAF로 hover 상태 업데이트를 묶어서 리페인트/리스타일 비용 감소
  const onEnter = (i: number) => {
    requestAnimationFrame(() => setHover(i))
  }
  const onLeave = () => setHover(null)

  return (
    <>
      <div
        className="grid"
        style={{ display: 'grid', gridTemplateColumns: '160px repeat(6,1fr)', gap: 6 }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            className="cell"
            onMouseEnter={() => onEnter(i)}
            onMouseLeave={onLeave}
            onClick={() => open(c)}
            role="button"
            tabIndex={0}
            // ✅ title 제거 → 기본 브라우저 툴팁은 리페인트 유발
            aria-label={`CR ${pct(c.cr, 1)} / 주문 ${fmt(c.orders)} / 클릭 ${fmt(c.clicks)}`}
            style={{
              background: heat(c.cr),
              outline: 'none',
              // 호버 시만 살짝 강조(가벼운 스타일만)
              boxShadow: hover === i ? '0 0 0 2px rgba(79,227,193,.45)' : 'none',
              transition: 'transform 80ms ease, box-shadow 80ms ease',
              transform: hover === i ? 'translateY(-1px)' : 'none',
              borderRadius: 8,
              width: '100%',
              height: 28,
            }}
          />
        ))}
      </div>

      {pick && (
        <div className="modal-backdrop" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3>
                {pick.product} × {pick.source}
              </h3>
              <button className="btn" onClick={close}>
                닫기
              </button>
            </div>
            {/* Spark는 values prop 사용(프로젝트 전역과 통일) */}
            <Spark values={pick.series} height={64} />
          </div>
        </div>
      )}
    </>
  )
}

function heat(v: number) {
  // 0~5% 범위 단순 보간 — 색 과장 없이 가독성 위주
  const t = Math.max(0, Math.min(1, v / 5))
  const g = Math.round(180 + 50 * t)
  const b = Math.round(180 - 80 * t)
  return `rgb(40,${g},${b})`
}
