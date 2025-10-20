'use client'

import React, { useMemo, useState } from 'react'
import { readCsvOrDemo, validate } from '@lib/csvSafe'
import { parseCsv, type CsvRow, type CsvTable } from '@lib/readCsv'
import { num, fmt, pct } from '@lib/num'
import ExportBar from '@cmp/ExportBar'
import VirtualTable from '@cmp/VirtualTable'
import ErrorBanner from '@cmp/ErrorBanner'
import Modal from '@cmp/Modal'
import Spark from '@cmp/Spark'

export default function Growth() {
  const raw = readCsvOrDemo('kpi_daily')
  const data: CsvTable = useMemo(() => (raw ? parseCsv(raw) : { headers: [], rows: [] }), [raw])
  const check = validate('kpi_daily', data)

  type Agg = { channel: string; visits: number; clicks: number; spend: number; orders: number; revenue: number }
  const by: Record<string, Agg> = {}
  for (const r of data.rows as CsvRow[]) {
    const ch = (r.channel as string) || 'unknown'
    const o = (by[ch] ||= { channel: ch, visits: 0, clicks: 0, spend: 0, orders: 0, revenue: 0 })
    o.visits  += num(r.visits)
    o.clicks  += num(r.clicks)
    o.spend   += num(r.ad_cost)
    o.orders  += num(r.orders)
    o.revenue += num(r.revenue)
  }
  const rows = Object.values(by).map(o => {
    const ROAS = o.spend ? o.revenue / o.spend : 0
    const CPA  = o.orders ? o.spend / o.orders : 0
    const CTR  = o.visits ? o.clicks / o.visits : 0
    return { ...o, ROAS, CPA, CTR }
  }).sort((a,b)=> b.ROAS - a.ROAS)

  const pct1 = (v:number)=> pct(v,1)

  // === 드릴다운 상태 ===
  const [open, setOpen] = useState(false)
  const [sel, setSel]   = useState<string | null>(null)

  const last30ByChannel = useMemo(()=>{
    const src = (data.rows as CsvRow[]).slice(-30)
    const map: Record<string,{rev:number[]; roas:number[]}> = {}
    for(const r of src){
      const ch = String(r.channel ?? 'unknown')
      const rev  = num(r.revenue)
      const cost = num(r.ad_cost)
      ;(map[ch] ||= {rev:[], roas:[]}).rev.push(rev)
      ;(map[ch] ||= {rev:[], roas:[]}).roas.push(cost ? rev/cost : 0)
    }
    return map
  },[data.rows])

  const openDrill = (ch:string)=>{
    setSel(ch); setOpen(true)
  }

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <h1>채널 리그(ROAS/CPA/CTR)</h1>
        <ExportBar selector="#growth-table" />
      </div>

      {!check.ok && (
        <ErrorBanner tone="warn" title="CSV 스키마 누락"
          message={`필수 컬럼이 없습니다: ${check.missing.join(', ')}`} show />
      )}

      {rows.length === 0 ? (
        <div className="skeleton" />
      ) : (
        <div id="growth-table" style={{ marginTop: 12 }}>
          <VirtualTable
            className="table"
            rows={rows}
            height={420}
            rowHeight={40}
            rowKey={(r) => (r as any).channel}
            columns={[
              { key: 'channel', header: '채널', width: 140, sortable:true, render: r => (
                <button className="btn" onClick={(e)=>{e.preventDefault(); openDrill((r as any).channel)}} style={{background:'transparent', border:'none', padding:0, color:'var(--text)'}}>
                  {(r as any).channel}
                </button>
              )},
              { key: 'visits',  header: '방문',   className:'num', width:110, sortable:true, render:r=>fmt((r as any).visits) },
              { key: 'clicks',  header: '클릭',   className:'num', width:110, sortable:true, render:r=>fmt((r as any).clicks) },
              { key: 'orders',  header: '주문',   className:'num', width:110, sortable:true, render:r=>fmt((r as any).orders) },
              { key: 'revenue', header: '매출',   className:'num', width:130, sortable:true, render:r=>fmt((r as any).revenue) },
              { key: 'spend',   header: '광고비', className:'num', width:130, sortable:true, render:r=>fmt((r as any).spend) },
              { key: 'ROAS',    header: 'ROAS',   className:'num', width:110, sortable:true, render:r=>pct1((r as any).ROAS) },
              { key: 'CPA',     header: 'CPA',    className:'num', width:130, sortable:true, render:r=>fmt((r as any).CPA) },
              { key: 'CTR',     header: 'CTR',    className:'num', width:110, sortable:true, render:r=>pct1((r as any).CTR) },
            ]}
          />
        </div>
      )}

      {/* 드릴다운 모달 */}
      <Modal open={open} onClose={()=>setOpen(false)} title={`드릴다운: ${sel ?? ''}`}>
        {sel && (
          <div className="tabs small" style={{display:'grid', gap:12}}>
            <span className="badge">최근 30일 매출</span>
            <Spark series={(last30ByChannel[sel]?.rev ?? []).map(Number)} width={520} height={100} />
            <span className="badge">최근 30일 ROAS</span>
            <Spark series={(last30ByChannel[sel]?.roas ?? []).map(Number)} width={520} height={100} />
          </div>
        )}
      </Modal>
    </div>
  )
}


