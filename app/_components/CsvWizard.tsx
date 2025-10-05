'use client'
import React, {useState} from 'react';
import { readCsvLS, writeCsvLS } from '../_lib/readCsv';

const EXPECT: Record<string,string[]> = {
  kpi_daily: ['date','channel','visits','clicks','carts','orders','revenue','ad_cost','returns','reviews'],
  creative_results: ['date','creative_id','impressions','clicks','spend','orders','revenue'],
  ledger: ['date','quest_id','type','stable_amt','edge_amt','lock_until','proof_url']
};

const DEMO: Record<string,string> = {
  kpi_daily: `date,channel,visits,clicks,carts,orders,revenue,ad_cost,returns,reviews
2025-10-01,meta,1200,180,60,18,540000,240000,1,3
2025-10-02,meta,1000,160,50,15,420000,210000,2,4
2025-10-03,naver,800,72,30,10,300000,90000,0,2
2025-10-04,ttads,900,110,40,12,360000,150000,1,1
2025-10-05,meta,950,140,42,14,420000,170000,1,2`,
  creative_results: `date,creative_id,impressions,clicks,spend,orders,revenue
2025-10-01,A1,30000,90,80000,6,180000
2025-10-02,A2,25000,70,70000,5,150000
2025-10-03,B1,18000,45,40000,3,90000`,
  ledger: `date,quest_id,type,stable_amt,edge_amt,lock_until,proof_url
2025-10-02,MQ1-1,daily,5000,0,2025-10-09,https://example.com/proof1
2025-10-04,WB-1,weekly,20000,5000,2025-10-11,https://example.com/proof2`
};

export default function CsvWizard(){
  const [key,setKey] = useState<keyof typeof EXPECT>('kpi_daily');
  const [csv,setCsv] = useState(readCsvLS('kpi_daily') || '');
  const [msg,setMsg] = useState('');

  const load = (k: keyof typeof EXPECT)=>{
    setKey(k);
    setCsv(readCsvLS(k) || '');
    setMsg('');
  }

  const injectDemo = ()=>{
    setCsv(DEMO[key]);
    setMsg('데모 데이터를 불러왔습니다. 검증 후 저장하세요.');
  }

  const validate = ()=>{
    if (!csv.trim()){ setMsg('CSV가 비어있습니다.'); return; }
    const first = csv.trim().split(/\r?\n/)[0];
    const got = first.split(',').map(s=>s.trim());
    const need = EXPECT[key];
    const ok = need.every(h => got.includes(h));
    setMsg(ok ? '✅ 헤더 검증 통과' : `❌ 헤더 불일치. 필요: ${need.join(', ')}`);
  }

  const save = ()=>{
    writeCsvLS(key, csv);
    setMsg('💾 저장 완료 (브라우저 로컬스토리지). 대시보드에서 즉시 반영됩니다.');
  }

  return (
    <div className="tool-card">
      <h2>CSV 업로드 위저드</h2>
      <div className="row">
        <label>데이터셋</label>
        <select value={key} onChange={e=>load(e.target.value as any)}>
          <option value="kpi_daily">kpi_daily</option>
          <option value="creative_results">creative_results</option>
          <option value="ledger">ledger</option>
        </select>
        <button className="btn" onClick={injectDemo}>데모 주입</button>
        <button className="btn" onClick={validate}>검증</button>
        <button className="btn primary" onClick={save}>저장</button>
      </div>
      <p className="muted">필수 헤더: {EXPECT[key].join(', ')}</p>
      <textarea value={csv} onChange={e=>setCsv(e.target.value)} rows={14} spellCheck={false} />
      <div className="status">{msg}</div>
    </div>
  )
}
