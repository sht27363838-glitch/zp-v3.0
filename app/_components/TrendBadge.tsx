'use client'
import React from 'react'

export default function TrendBadge({
  now, prev, suffix = '', digits = 1, invert = false,
}: {
  now: number;        // 현재 값
  prev: number;       // 비교 기준(전일/전주/전월)
  suffix?: string;    // %, 원 등 단위
  digits?: number;    // 소수점 자리
  invert?: boolean;   // 낮을수록 좋은 지표면 true (반품률 등)
}) {
  const basePrev = prev || 0
  const diffAbs = now - basePrev
  const diffPct = basePrev ? diffAbs / basePrev : 0
  const good = invert ? diffAbs < 0 : diffAbs > 0
  const zero = !isFinite(diffPct) || basePrev === 0

  const arrow = zero ? '•' : good ? '▲' : diffAbs === 0 ? '•' : '▼'
  const tone  = zero ? 'var(--muted)' : good ? 'var(--green, #36d399)' : 'var(--danger, #ff6b6b)'

  const fmtPct = `${(diffPct * 100).toFixed(digits)}%`
  const txt = basePrev === 0 ? '—' : fmtPct

  return (
    <span className="badge" style={{ background:'transparent', color:tone, border:'1px solid rgba(255,255,255,.15)' }}>
      {arrow} {txt}{suffix && ` ${suffix}`}
    </span>
  )
}
