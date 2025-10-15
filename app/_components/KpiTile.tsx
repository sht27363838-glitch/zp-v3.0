// app/_components/KpiTile.tsx
'use client'
import React from 'react'

type Props = {
  label: string
  value: string
  note?: string
  right?: React.ReactNode
  onClick?: () => void
}

export default function KpiTile({ label, value, note, right, onClick }: Props) {
  // 클릭 가능/불가에 따라 태그와 테두리 스타일 분기
  const Tag: any = onClick ? 'button' : 'div'
  const ring =
    onClick
      ? 'ring-1 ring-indigo-300 hover:ring-indigo-400 bg-white'
      : 'ring-1 ring-slate-200 bg-white'; // ← 세미콜론 필수!

  return (
    <Tag
      onClick={onClick}
      className={
        'kpi-tile rounded-xl p-4 shadow-sm transition ' +
        'text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ' +
        ring
      }
      style={{ minWidth: 220, wordBreak: 'keep-all' }}
    >
      <div className="label text-slate-600 text-sm mb-1">{label}</div>

      <div
        className="row"
        style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}
      >
        <div className="value text-slate-900 text-2xl font-extrabold">{value}</div>
        {right && <div className="right">{right}</div>}
      </div>

      {note && <div className="muted text-slate-500 text-xs mt-1">{note}</div>}
    </Tag>
  )
}
