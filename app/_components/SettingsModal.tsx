'use client'
import React, { useMemo, useState } from 'react'
import { parseCsv, toCsv, readCsvLS, writeCsvLS } from '@lib/readCsv'

export default function SettingsModal({open, onClose}:{open:boolean; onClose:()=>void}) {
  const raw = readCsvLS('settings') || ''
  const init = useMemo(()=> {
    try {
      const rows = parseCsv(raw).rows as any[]
      const r0 = rows[0] || {}
      return {
        last_month_profit: Number(r0.last_month_profit||0) || 1_000_000,
        month_goal: Number(r0.month_goal||0) || 0,
      }
    } catch { return { last_month_profit:1_000_000, month_goal:0 } }
  }, [raw])

  const [profit, setProfit] = useState<number>(init.last_month_profit)
  const [goal, setGoal] = useState<number>(init.month_goal)

  function save(){
    const table = {
      headers: ['last_month_profit','month_goal'],
      rows: [{ last_month_profit: profit, month_goal: goal }] as any[]
    }
    writeCsvLS('settings', toCsv(table as any))
    onClose()
    location.reload()
  }

  if(!open) return null
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-body" onClick={e=>e.stopPropagation()} style={{minWidth:360}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <b>설정 편집</b>
          <button className="btn" onClick={onClose}>닫기</button>
        </div>

        <div style={{marginTop:12}}>
          <label className="muted" style={{fontSize:12}}>전월 순익(기준)</label>
          <input type="number" value={profit} onChange={e=>setProfit(Number(e.target.value||0))}
                 style={{width:'100%', padding:10, borderRadius:10, border:'var(--border)', background:'var(--panel)', color:'var(--text)'}}/>
        </div>

        <div style={{marginTop:12}}>
          <label className="muted" style={{fontSize:12}}>이번 달 매출 목표</label>
          <input type="number" value={goal} onChange={e=>setGoal(Number(e.target.value||0))}
                 style={{width:'100%', padding:10, borderRadius:10, border:'var(--border)', background:'var(--panel)', color:'var(--text)'}}/>
        </div>

        <div className="row" style={{justifyContent:'flex-end', marginTop:16}}>
          <button className="btn primary" onClick={save}>저장</button>
        </div>
      </div>
    </div>
  )
}
