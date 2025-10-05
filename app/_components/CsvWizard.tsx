'use client';
import { saveCsvToLocal, csvTemplate } from '../_lib/readCsv';

export default function CsvWizard(){
  const templates = [
    ['kpi_daily','트래픽/매출 KPI'],
    ['ledger','보상 원장(바벨)'],
    ['creative_results','소재 결과(선택)'],
  ] as const;

  const onDownload=(name:string)=>{
    const blob = new Blob([csvTemplate(name as any)], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`${name}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const onUpload=(name:string, file:File)=>{
    file.text().then(txt=>{
      saveCsvToLocal(name, txt);
      alert(`${name} 업로드 완료`);
    });
  };

  return (
    <section className='card'>
      <h3>CSV 위저드</h3>
      <ol className='muted'>
        <li>템플릿을 내려받아 값을 입력</li>
        <li>아래에서 업로드 → 로컬 저장</li>
        <li>/report·/growth·/rewards 즉시 반영</li>
      </ol>
      <div className='stack'>
        {templates.map(([key,label])=>
          <div key={key} className='row gap'>
            <button className='btn warn' onClick={()=>onDownload(key)}>템플릿 다운로드 — {label}</button>
            <label className='btn primary'>
              CSV 업로드
              <input type='file' accept='.csv' style={{display:'none'}}
                     onChange={e=>{const f=e.target.files?.[0]; if(f) onUpload(key,f);}}/>
            </label>
          </div>
        )}
      </div>
    </section>
  );
}
