'use client'
import React, { useMemo } from 'react'
import { readCsvOrDemo } from '@lib/csvSafe'
import { parseCsv, type CsvRow } from '@lib/readCsv'
import { fmt, num } from '@lib/num'
import ExportBar from '@cmp/ExportBar'
import VirtualTable from '@cmp/VirtualTable'

type Row = CsvRow & {
  mission?: string
  type?: string        // daily / bonus 등
  stable?: number
  edge?: number
  note?: string
  lock_until?: string
}

export default function RewardsPage(){
  const raw = readCsvOrDemo('ledger') || ''
  const { rows } = useMemo(()=> parseCsv(raw), [raw])

  const items = (rows as Row[]).map(r=>({
    date: String(r.date??''),
    mission: String(r.mission??''),
    type: String(r.type??''),
    stable: num(r.stable),
    edge: num(r.edge),
    total: num(r.stable) + num(r.edge),
    note: String(r.note??''),
    lock_until: String(r.lock_until??''),
  }))

  const total = useMemo(()=> items.reduce((s,r)=> s + r.total, 0), [items])
  const locked = useMemo(()=> items.filter(r=> (r.note||'').toUpperCase().includes('LOCK') || r.lock_until), [items])

  return (
    <div className="page">
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <h1>보상 현황</h1>
        <ExportBar selector="#rewards-table" />
        <span className="badge">총액 {fmt(total)}</span>
        {locked.length>0 && <span className="badge">잠금 {locked.length}건</span>}
      </div>

      {items.length===0 ? (
        <div className="empty-state">데이터 없음. Tools 탭에서 Ledger 데모를 주입하세요.</div>
      ) : (
        <div id="rewards-table" style={{marginTop:12}}>
          <VirtualTable
            className="table"
            rows={items}
            height={420}
            rowHeight={40}
            rowKey={(r,i)=> `${r.date}-${r.mission}-${i}`}
            columns={[
              { key:'date', header:'날짜', width:120, sortable:true, render:r=>r.date },
              { key:'mission', header:'미션', width:180, sortable:true, render:r=>r.mission },
              { key:'type', header:'유형', width:110, sortable:true, render:r=>r.type },
              { key:'stable', header:'Stable', className:'num', width:120, sortable:true, render:r=>fmt(r.stable) },
              { key:'edge', header:'Edge', className:'num', width:120, sortable:true, render:r=>fmt(r.edge) },
              { key:'total', header:'합계', className:'num', width:130, sortable:true, render:r=>fmt(r.total) },
              { key:'lock_until', header:'Lock Until', width:140, sortable:true, render:r=>r.lock_until || '-' },
              { key:'note', header:'비고', width:200, render:r=>r.note || '' },
            ]}
          />
        </div>
      )}
    </div>
  )
}
