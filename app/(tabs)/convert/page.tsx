// app/(tabs)/convert/page.tsx
'use client'

import React, { useMemo } from 'react'
import ExportBar from '@cmp/ExportBar'
import HeatMap from '@cmp/HeatMap'
import { readCsvOrDemo } from '@lib/csvSafe'
import { parseCsv, type CsvRow } from '@lib/readCsv'
import { fmt } from '@lib/num'

export default function ConvertPage(){
  const raw = readCsvOrDemo('kpi_daily')
  const data = useMemo(()=> parseCsv(raw), [raw])

  // 임시 SKU 분배(데모용) – 날짜 인덱스로 3개 sku 라운드로빈
  const rows = useMemo(()=>{
    const src = data.rows as CsvRow[]
    return src.map((r, i)=>({
      date: String(r.date ?? ''),
      channel: String(r.channel ?? 'unknown'),
      product: ['sku-1','sku-2','sku-3'][i % 3],
      visits: Number(r.visits ?? 0),
      clicks: Number(r.clicks ?? 0),
      orders: Number(r.orders ?? 0),
      ad_cost: Number(r.ad_cost ?? 0),
    }))
  },[data.rows])

  return (
    <div className="page">
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <h1>C2 — 전환/커머스 레이더</h1>
        <ExportBar selector="#convert-heat" />
      </div>

      <div id="convert-heat" style={{marginTop:12}}>
        <HeatMap
          rows={rows}
          xKey="channel"
          yKey="product"
          onCellClick={({x,y,cr,orders,clicks})=>{
            alert(`${y} × ${x}\nCR ${(cr*100).toFixed(1)}%\n주문 ${fmt(orders)} / 클릭 ${fmt(clicks)}`)
          }}
        />
      </div>
    </div>
  )
}
