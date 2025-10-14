// app/_components/KpiTile.tsx
'use client'
import type { ReactNode } from 'react'

type Props = {
  label: string
  /** 문자열/숫자/커스텀 노드 모두 허용 → pct(), fmt() 결과 어떤 형태여도 안전 */
  value: string | number | ReactNode
  /** 작은 보조 설명(선택) */
  note?: string
  /** 클릭 시 드릴다운 등(선택) */
  right?: React.ReactNode    
  onClick?: () => void
  /** 경고/위험 등 색상 토큰(선택): 'ok' | 'warn' | 'danger' */
  tone?: 'ok' | 'warn' | 'danger'
}

export default function KpiTile({ label, value, note, onClick, tone }: Props) {
  // 접근성: 버튼/디브 자동 전환
  const Tag: any = onClick ? 'button' : 'div'
  // 색상 토큰(프로젝트 공통 .badge/.btn 디자인과 어울리는 가벼운 보정)
  const toneClass =
    tone === 'danger'
      ? 'ring-1 ring-red-400/60 bg-red-50'
      : tone === 'warn'
      ? 'ring-1 ring-amber-400/60 bg-amber-50'
      : tone === 'ok'
      ? 'ring-1 ring-emerald-400/60 bg-emerald-50'
      : 'ring-1 ring-slate-200 bg-white'

  return (
    <Tag
      className={
        'kpi-tile rounded-xl p-4 shadow-sm hover:shadow-md transition ' +
        'text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ' +
        toneClass +
        (onClick ? ' cursor-pointer' : '')
      }
      onClick={onClick}
      aria-label={onClick ? `${label} 상세 열기` : undefined}
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold leading-tight">
        {value}
      </div>
      {note ? (
        <div className="mt-1 text-[11px] text-slate-400">{note}</div>
      ) : null}
    </Tag>
  )
}
