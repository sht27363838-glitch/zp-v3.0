// app/(tabs)/rewards/page.tsx
'use client'

import React, { useMemo } from 'react'
import { sourceTag, readCsvOrDemo, validate } from '@lib/csvSafe'
import { parseCsv } from '@lib/readCsv'
import { num, fmt } from '@lib/num'
import KpiTile from '@cmp/KpiTile'
import ErrorBanner from '@cmp/ErrorBanner'
import ExportBar from '@cmp/ExportBar'
import VirtualTable from '@cmp/VirtualTable'

type LedgerRow = {
  date?: string
  mission?: string
  type?: string
  stable?: number | string
  edge?: number | string
  note?: string
  lock_until?: string
}

export default function RewardsPage() {
  // CSV 로드
  const raw = readCsvOrDemo('ledger')
  const data = useMemo(() => parseCsv(raw), [raw])
  const check = validate('ledger', data)

  // 합계
  const sums = useMemo(() => {
    let stable = 0, edge = 0, lockedCount = 0
    const rows = data.rows as LedgerRow[]
    for (const r of rows) {
      stable += num(r.stable)
      edge   += num(r.edge)
      const locked = String(r.lock_until ?? '').trim()
        || String(r.note ?? '').toUpperCase().includes('LOCK')
      if (locked) lockedCount++
    }
    return { stable, edge, lockedCount, total: stable + edge, count: rows.length }
  }, [data.rows])

  // 테이블 행
  const rows = useMemo(() => {
    const src = (data.rows as LedgerRow[]) || []
    return src.map(r => {
      const lockFlag = (String(r.lock_until ?? '').trim().length > 0)
        || String(r.note ?? '').toUpperCase().includes('LOCK')
      return {
        ...r,
        __stable: num(r.stable),
        __edge: num(r.edge),
        __lock: lockFlag,
      }
    })
  }, [data.rows])

  return (
    <div className="page">
      {/* 타이틀 + 내보내기 + 데이터소스 배지 */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <h1>보상(Rewards) — Ledger 요약</h1>
        <ExportBar selector="#rewards-table" />
        <span className="badge">{sourceTag('ledger')}</span>
      </div>

      {/* 스키마 검증 */}
      {!check.ok && (
        <ErrorBanner
          tone="warn"
          title="CSV 스키마 누락"
          message={`필수 컬럼이 없습니다: ${check.missing.join(', ')}`}
          show
        />
      )}

      {/* KPI 요약 */}
      <div className="kpi-grid">
        <KpiTile label="총 보상(STABLE+EDGE)" value={fmt(sums.total)} />
        <KpiTile label="STABLE 합계" value={fmt(sums.stable)} />
        <KpiTile label="EDGE 합계" value={fmt(sums.edge)} />
        <KpiTile label="잠금 건수" value={fmt(sums.lockedCount)} note={`총 ${fmt(sums.count)}건 중`} />
      </div>

      {/* 테이블 */}
      <div id="rewards-table" style={{ marginTop: 12 }}>
        <VirtualTable<LedgerRow & { __stable:number; __edge:number; __lock:boolean }>
          className="table"
          rows={rows}
          height={480}
          rowHeight={40}
          rowKey={(r, i) => `${String(r.date ?? '')}-${String(r.mission ?? '')}-${i}`}
          columns={[
            {
              key: 'date',
              header: '날짜',
              width: 120,
              sortable: true,
              // 날짜 정렬 키
              sortKey: r => Date.parse(String(r.date ?? '')) || 0,
              render: r => String(r.date ?? ''),
            },
            {
              key: 'mission',
              header: '미션',
              width: 180,
              sortable: true,
              render: r => String(r.mission ?? ''),
            },
            {
              key: 'type',
              header: '유형',
              width: 110,
              sortable: true,
              render: r => String(r.type ?? ''),
            },
            {
              key: '__stable',
              header: 'STABLE',
              width: 130,
              className: 'num',
              sortable: true,
              sortKey: r => r.__stable,
              render: r => fmt(r.__stable),
            },
            {
              key: '__edge',
              header: 'EDGE',
              width: 130,
              className: 'num',
              sortable: true,
              sortKey: r => r.__edge,
              render: r => fmt(r.__edge),
            },
            {
              key: 'note',
              header: '비고',
              width: 220,
              sortable: true,
              render: r => {
                const txt = String(r.note ?? '')
                const isLock = r.__lock
                return (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {isLock && <span className="badge" style={{ background:'rgba(255,99,132,.15)', borderColor:'rgba(255,99,132,.35)' }}>LOCK</span>}
                    <span title={txt}>{txt}</span>
                  </div>
                )
              },
            },
            {
              key: 'lock_until',
              header: '잠금 해제일',
              width: 140,
              sortable: true,
              render: r => String(r.lock_until ?? ''),
            },
          ]}
        />
      </div>

      <div style={{ marginTop:16, opacity:.8 }}>
        <p className="text-sm">데이터 원본: <code>ledger.csv</code></p>
      </div>
    </div>
  )
}
