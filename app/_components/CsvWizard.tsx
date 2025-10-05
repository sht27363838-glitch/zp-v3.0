'use client';

import React, {useEffect, useMemo, useState} from 'react';
import { datasetKeys, DatasetKey, readCsvLS, writeCsvLS, clearCsvLS, lastSavedAt, validateHeaders, requiredHeaders } from '../_lib/readCsv';

const DEMO: Record<DatasetKey, string> = {
  kpi_daily: `date,channel,visits,clicks,carts,orders,revenue,ad_cost,returns,reviews
2025-10-01,meta,1000,80,30,10,300000,120000,0,5
2025-10-01,tiktok,800,60,20,6,150000,70000,0,2
2025-10-02,meta,1100,90,32,11,330000,130000,0,4
2025-10-02,tiktok,850,65,22,7,170000,72000,0,2
2025-10-03,meta,900,70,25,8,240000,90000,0,3
2025-10-03,tiktok,820,62,21,6,160000,68000,0,1
`,
  ledger: `date,mission,type,locked,vested,unlock_end,status
2025-10-01,리뷰 리워드,stable,0,10000,2025-12-31,진행
2025-10-02,환불 보정,edgy,0,5000,2025-11-30,완료
`,
  creative_results: `date,channel,adset,creative,spend,impressions,clicks,orders,revenue
2025-10-01,meta,AS1,CR1,50000,20000,200,5,150000
2025-10-01,tiktok,AS2,CR3,30000,15000,120,3,90000
`,
};

function tsLabel(ts: number|null){
  if (!ts) return '—';
  const d = new Date(ts);
  const pad = (n:number)=> n.toString().padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CsvWizard(){
  const [ds, setDs] = useState<DatasetKey>('kpi_daily');
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<string>('');

  useEffect(()=>{
    const saved = readCsvLS(ds) || '';
    setText(saved);
    setMsg('');
  }, [ds]);

  const vres = useMemo(()=> validateHeaders(text||'', ds), [text, ds]);
  const last = useMemo(()=> tsLabel(lastSavedAt(ds)), [ds, text]);

  const onTemplate = ()=>{
    const header = requiredHeaders[ds].join(',');
    setText(header+'\n');
    setMsg('템플릿 헤더가 채워졌습니다.');
  };
  const onDemo = ()=>{
    setText(DEMO[ds]);
    setMsg('데모 데이터가 채워졌습니다.');
  };
  const onValidate = ()=>{
    if (vres.ok) setMsg('✅ 검증 성공: 필수 헤더 이상 없음.');
    else setMsg(`⚠️ 누락 헤더: ${vres.missing.join(', ')}`);
  };
  const onSave = ()=>{
    writeCsvLS(ds, text.trim());
    setMsg('💾 저장 완료! 각 탭에서 즉시 반영됩니다.');
  };
  const onClear = ()=>{
    clearCsvLS(ds);
    setText('');
    setMsg('🧹 삭제 완료. 이 데이터셋은 빈 상태입니다.');
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl font-semibold">CSV 업로드 위저드</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <label className="opacity-75">데이터셋</label>
        <select value={ds} onChange={e=>setDs(e.target.value as DatasetKey)} className="inp">
          {datasetKeys.map(k=><option key={k} value={k}>{k}</option>)}
        </select>

        <button className="btn" onClick={onTemplate}>템플릿</button>
        <button className="btn" onClick={onDemo}>데모 주입</button>
        <button className="btn" onClick={onValidate}>검증</button>
        <button className="btn primary" onClick={onSave}>저장</button>
        <button className="btn danger" onClick={onClear}>비우기</button>
      </div>

      <div className="text-sm opacity-70 mb-2">
        필수 헤더: {requiredHeaders[ds].join(', ')} / 마지막 저장: {last}
      </div>

      <textarea
        value={text}
        onChange={e=>setText(e.target.value)}
        placeholder="여기에 CSV를 붙여넣으십시오."
        className="w-full h-64 rounded-md p-3 bg-[#14181c] border border-[#2a2f35] outline-none"
      />

      <div className="mt-3 text-sm">
        {msg && <div className="mb-2">{msg}</div>}
        {!vres.ok &&
          <div className="badge">누락: {vres.missing.join(', ') || '없음'}</div>
        }
      </div>

      <style jsx>{`
        .card{ background:#0f1317; border:1px solid #25303a; border-radius:14px; }
        .btn{ padding:6px 10px; border-radius:10px; border:1px solid #2b3b47; background:#12202b; }
        .btn.primary{ background:#0b3b52; border-color:#0e4b67; }
        .btn.danger{ background:#3a1114; border-color:#5a1a1f; }
        .inp{ background:#10161b; border:1px solid #2b3b47; padding:6px 8px; border-radius:8px; }
        .badge{ display:inline-block; padding:4px 8px; border-radius:999px; background:#2b1f0b; border:1px solid #4a3716; }
      `}</style>
    </div>
  );
}
