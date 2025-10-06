'use client';

import React, {useEffect, useMemo, useState} from 'react';
import { datasetKeys, DatasetKey, readCsvLS, writeCsvLS, clearCsvLS, lastSavedAt, validateHeaders, requiredHeaders } from '../_lib/readCsv';

const DEMO: Record<DatasetKey, string> = {
 // 1) 일일 KPI
  kpi_daily: `date,channel,visits,clicks,carts,orders,revenue,ad_cost,returns,reviews
2025-10-01,meta,1000,80,30,10,300000,120000,0,5
2025-10-01,tiktok,800,60,20,6,150000,70000,0,2
2025-10-02,meta,1100,88,33,11,330000,125000,1,4`,

  // 2) 크리에이티브 성과
  creative_results: `date,creative_id,impressions,clicks,spend,orders,revenue
2025-10-01,CR001,50000,700,90000,8,230000
2025-10-01,CR002,30000,360,40000,3,90000`,

  // 3) 보상 원장(ledger)
  ledger: `date,type,mission,stable,edge,note,lock_until
2025-10-01,daily,Daily Loop,30000,0,,2025-10-08
2025-10-02,weekly,Weekly Boss,60000,15000,,2025-11-01`,

  // 4) 리밸런싱 로그
  rebalance_log: `date,from_to,amount,reason
2025-10-03,edge->stable,20000,edge>30% 방어
2025-10-10,stable->edge,15000,공격 모드`,

  // 5) 커머스 세부 품목
  commerce_items: `order_id,sku,qty,price,discount,source
A001,SKU-RED,1,30000,0,meta
A002,SKU-BLK,2,45000,5000,tiktok`,

  // 6) 구독 정보(있다면)
  subs: `customer_id,start_date,billing_n,status
U001,2025-09-15,2,active
U002,2025-10-01,1,trial`,

  // 7) 반품 사유
  returns: `order_id,sku,reason,date
A002,SKU-BLK,사이즈 불만,2025-10-05`,

  // 8) 설정
  settings: `last_month_profit,cap_ratio,edge_min,edge_max
2000000,0.10,0.15,0.30`
}

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
