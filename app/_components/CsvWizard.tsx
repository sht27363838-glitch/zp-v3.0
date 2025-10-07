'use client'

import React, {useEffect, useMemo, useState} from 'react'
import {
  datasetKeys, type DatasetKey,
  readCsvLS, writeCsvLS, clearCsvLS,
  lastSavedAt, validateHeaders, parseCsv
} from '../_lib/readCsv'

/** 간단 타임스탬프 라벨 */
function tsLabel(ms: number) {
  if (!ms) return '—'
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function CsvWizard() {
  const [ds, setDs] = useState<DatasetKey>('kpi_daily')
  const [text, setText] = useState<string>('')
  const [msg, setMsg] = useState<string>('')

  // 초기 로드
  useEffect(() => {
    const raw = readCsvLS(ds) || ''
    setText(raw)
    setMsg('')
  }, [ds])

  // 미리보기/검증
  const preview = useMemo(() => parseCsv(text || ''), [text])
  // ✅ validateHeaders는 누락 헤더 string[]을 반환
  const missing = useMemo(() => validateHeaders(text || '', ds), [text, ds])
  const isOk = missing.length === 0
  const last = useMemo(() => tsLabel(lastSavedAt(ds)), [ds, text])

  const onTemplate = () => {
    // 아주 최소 템플릿 (필요시 확장)
    if (ds === 'kpi_daily') {
      setText(
`date,channel,visits,clicks,carts,orders,revenue,ad_cost,returns,reviews
2025-10-01,meta,1000,80,30,10,300000,120000,0,5
2025-10-02,meta,950,75,28,9,270000,110000,0,4`
      )
    } else if (ds === 'ledger') {
      setText(
`date,mission,type,stable,edge,note,lock_until
2025-10-01,Daily Loop,daily,10000,3000,,`
      )
    } else {
      setText('')
    }
  }

  const onSave = () => {
    writeCsvLS(ds, text || '')
    setMsg('✅ 저장 완료')
    setTimeout(() => setMsg(''), 1500)
  }

  const onClear = () => {
    clearCsvLS(ds)
    setText('')
    setMsg('🧹 삭제 완료')
    setTimeout(() => setMsg(''), 1500)
  }

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between', alignItems:'center', gap:12}}>
        <div className="row" style={{gap:8, alignItems:'center'}}>
          <b>CSV 위저드</b>
          <select
            value={ds}
            onChange={e => setDs(e.target.value as DatasetKey)}
            className="input"
          >
            {datasetKeys.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <span className="badge">last: {last}</span>
          {/* ✅ 객체가 아니라 배열 길이로 표시 */}
          {isOk ? (
            <span className="badge success">헤더 OK</span>
          ) : (
            <span className="badge danger">누락: {missing.join(', ') || '—'}</span>
          )}
        </div>
        <div className="row" style={{gap:8}}>
          <button className="btn" onClick={onTemplate}>템플릿</button>
          <button className="btn danger" onClick={onClear}>삭제</button>
          <button className="btn primary" onClick={onSave}>저장</button>
        </div>
      </div>

      {msg && <div className="muted" style={{marginTop:6}}>{msg}</div>}

      <textarea
        className="input"
        style={{width:'100%', height:180, marginTop:12, fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace'}}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="여기에 CSV 붙여넣기"
      />

      <div className="muted" style={{marginTop:8, marginBottom:6}}>미리보기(상위 5행)</div>
      {/* 긴 표 스크롤 */}
      <div className="scroll">
        {!preview.rows.length ? (
          <div className="skeleton" style={{height:120}} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                {preview.headers.map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {preview.rows.slice(0, 5).map((r, i) => (
                <tr key={i}>
                  {preview.headers.map(h => <td key={h}>{String((r as any)[h] ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
