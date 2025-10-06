// app/_components/CsvWizard.tsx
'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {
  datasetKeys, type DatasetKey,
  readCsvLS, writeCsvLS, clearCsvLS, lastSavedAt,
  validateHeaders, requiredHeaders, parseCsv
} from '../_lib/readCsv';

// 데모 템플릿(필수 키 모두 제공)
const DEMO: Record<DatasetKey, string> = {
  kpi_daily: `date,channel,visits,clicks,carts,orders,revenue,ad_cost,returns,reviews
2025-10-01,meta,1000,80,30,10,300000,120000,0,5
2025-10-02,meta,900,70,25,8,240000,100000,1,4`,
  ledger: `date,mission,type,stable,edge,note,lock_until
2025-10-01,Daily Loop,daily,20000,0,,`,
  creative_results: `date,creative_id,impressions,clicks,spend,orders,revenue
2025-10-01,CR001,20000,200,120000,8,240000`,
  rebalance_log: `date,from_to,amount,reason
2025-10-05,edge->stable,50000,edge over 30%`,
  commerce_items: `order_id,sku,qty,price,discount,source
O1001,S1,1,30000,0,meta`,
  subs: `customer_id,start_date,billing_n,status
C001,2025-09-01,2,active`,
  returns: `order_id,sku,reason,date
O1001,S1,defect,2025-10-02`,
  settings: `last_month_profit,cap_ratio,edge_min,edge_max
1000000,0.10,0.15,0.30`,
};

function tsLabel(ts:number){
  if(!ts) return '—';
  const d = new Date(ts);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
  const hh = String(d.getHours()).padStart(2,'0'), mm = String(d.getMinutes()).padStart(2,'0');
  return `${y}-${m}-${dd} ${hh}:${mm}`;
}

export default function CsvWizard(){
  // 선택 데이터셋
  const [ds, setDs] = useState<DatasetKey>('kpi_daily');
  // 텍스트 영역 내용
  const [text, setText] = useState<string>('');

  // 최초 로드: 로컬에 있으면 불러오기
  useEffect(()=>{
    const raw = readCsvLS(ds) || DEMO[ds];
    setText(raw || '');
  }, [ds]);

  // 헤더 검증/저장시간
  const vres = useMemo(()=> validateHeaders(text||'', ds), [text, ds]);
  const last  = useMemo(()=> tsLabel(lastSavedAt(ds)), [ds, text]);

  // 동작들
  const onTemplate = ()=> setText(DEMO[ds] || '');
  const onSave = ()=>{
    writeCsvLS(ds, text||'');
    alert('저장 완료');
  };
  const onClear = ()=>{
    clearCsvLS(ds);
    setText(DEMO[ds] || '');
    alert('초기화 완료');
  };
  const onDownload = ()=>{
    const blob = new Blob([text||''], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${ds}.csv`;
    a.click();
  };
  const onUpload = (f: File)=>{
    const reader = new FileReader();
    reader.onload = ()=>{
      const t = String(reader.result||'');
      setText(t);
    };
    reader.readAsText(f);
  };

  return (
    <div className="tool-card">
      <div className="row" style={{gap:12, alignItems:'center', marginBottom:8}}>
        <label>데이터셋</label>
        <select value={ds} onChange={e=>setDs(e.target.value as DatasetKey)}>
          {datasetKeys.map(k=> <option key={k} value={k}>{k}</option>)}
        </select>
        <span className="badge">last: {last}</span>
        {vres.ok ? <span className="badge success">헤더 OK</span>
                 : <span className="badge danger">누락: {vres.missing.join(', ')||'—'}</span>}
      </div>

      <div style={{display:'flex', gap:12, flexWrap:'wrap', marginBottom:8}}>
        <button className="btn" onClick={onTemplate}>템플릿</button>
        <button className="btn primary" onClick={onSave}>저장</button>
        <button className="btn warn" onClick={onClear}>초기화</button>
        <button className="btn" onClick={onDownload}>다운로드</button>
        <label className="btn">
          업로드
          <input type="file" accept=".csv,text/csv" style={{display:'none'}}
                 onChange={e=> e.target.files?.[0] && onUpload(e.target.files[0])}/>
        </label>
      </div>

      <textarea
        value={text}
        onChange={e=>setText(e.target.value)}
        spellCheck={false}
        style={{width:'100%', minHeight:260}}
        placeholder={`CSV 붙여넣기 (${ds})`}
      />

      {/* 미리보기(상위 5행) */}
      <Preview csv={text}/>
    </div>
  );
}

function Preview({csv}:{csv:string}){
  const rows = useMemo(()=> parseCsv(csv).slice(0,5), [csv]);
  if(!rows.length) return null;
  const headers = Object.keys(rows[0]);
  return (
    <div style={{marginTop:12}}>
      <div className="muted" style={{marginBottom:4}}>미리보기(상위 5행)</div>
      <div style={{maxHeight:240, overflow:'auto'}}>
        <table className="table">
          <thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r,i)=><tr key={i}>{headers.map(h=><td key={h}>{r[h]}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
