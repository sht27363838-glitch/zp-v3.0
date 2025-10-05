'use client';
import React, { useRef, useState } from 'react';
import { parseCsv, saveCsv, sampleTemplate } from '../_lib/readCsv';

export default function CsvWizard(){
  const [msg, setMsg] = useState<string>('');
  const fileRef = useRef<HTMLInputElement|null>(null);

  const downloadTemplate = (name: string) => {
    const blob = new Blob([sampleTemplate(name)], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.csv`;
    a.click();
    setMsg(`${name}.csv 템플릿 다운로드`);
  };

  const onUpload = async (name: string, e: React.ChangeEvent<HTMLInputElement>)=>{
    const f = e.target.files?.[0]; if(!f) return;
    const text = await f.text();
    // 유효성 체크(헤더 존재)
    const rows = parseCsv(text);
    if (!rows.length && !text.startsWith(sampleTemplate(name).split('\n')[0])) {
      setMsg('CSV 형식이 올바르지 않습니다.');
      return;
    }
    saveCsv(name, text);
    setMsg(`${name}.csv 업로드 완료(로컬 저장)`);
    e.target.value = '';
  };

  return (
    <div className='stack gap'>
      <div className='row gap wrap'>
        <button className='btn' onClick={()=>downloadTemplate('kpi_daily')}>kpi_daily 템플릿</button>
        <button className='btn' onClick={()=>downloadTemplate('creative_results')}>creative_results 템플릿</button>
        <button className='btn' onClick={()=>downloadTemplate('ledger')}>ledger 템플릿</button>
      </div>

      <div className='row gap wrap'>
        <label className='uploader'>
          <input ref={fileRef} type='file' accept='.csv' onChange={(e)=>onUpload('kpi_daily',e)} hidden/>
          <span className='btn accent'>kpi_daily 업로드</span>
        </label>
        <label className='uploader'>
          <input type='file' accept='.csv' onChange={(e)=>onUpload('creative_results',e)} hidden/>
          <span className='btn accent'>creative_results 업로드</span>
        </label>
        <label className='uploader'>
          <input type='file' accept='.csv' onChange={(e)=>onUpload('ledger',e)} hidden/>
          <span className='btn accent'>ledger 업로드</span>
        </label>
      </div>

      {msg && <p className='badge info'>{msg}</p>}
      <style jsx>{`
        .wrap{flex-wrap:wrap}
        .uploader{display:inline-block}
        .btn{padding:8px 12px;border-radius:10px;border:1px solid #232A31;background:#161A1E;color:#E6EAF0}
        .btn.accent{border-color:#0EA5E9;background:#0EA5E911}
        .row{display:flex;gap:10px;align-items:center}
        .stack{display:flex;flex-direction:column;gap:14px}
        .badge{display:inline-block;padding:6px 10px;border-radius:10px;border:1px solid #232A31;background:#161A1E;color:#9BA7B4}
        .badge.info{border-color:#8B5CF6;color:#E6EAF0}
        .gap{gap:14px}
      `}</style>
    </div>
  );
}
