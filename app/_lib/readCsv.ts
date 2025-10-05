// 로컬스토리지에 저장된 CSV 읽기 + 간단 파서
export function readCsvFromLocal(name:string){
  if(typeof window==='undefined') return [] as any[];
  const raw = localStorage.getItem('csv:'+name) || '';
  if(!raw) return [];
  return parseCsv(raw);
}
export function saveCsvToLocal(name:string, text:string){
  if(typeof window==='undefined') return;
  localStorage.setItem('csv:'+name, text);
}
export function parseCsv(text:string){
  const lines = text.trim().split(/\r?\n/);
  if(!lines.length) return [];
  const headers = lines[0].split(',').map(h=>h.trim());
  return lines.slice(1).map(line=>{
    const cells = line.split(','); const obj:any = {};
    headers.forEach((h,i)=> obj[h]=cells[i]?.trim() ?? '');
    return obj;
  });
}
export function csvTemplate(name:'kpi_daily'|'ledger'|'creative_results'){
  if(name==='kpi_daily') return `date,channel,visits,clicks,carts,orders,revenue,ad_cost,returns,reviews
2025-10-01,meta,1000,120,30,20,500000,250000,1,3
2025-10-02,meta,900,110,28,18,430000,210000,0,2
2025-10-02,tiktok,800,100,20,12,300000,150000,0,1`;
  if(name==='ledger') return `date,quest_id,type,stable_amt,edge_amt,lock_until,proof_url
2025-10-01,Q-DAILY,daily,10000,0,2025-10-08,
2025-10-02,Q-WIN,weekly,15000,5000,2025-11-01,`;
  return `date,creative_id,impressions,clicks,spend,orders,revenue
2025-10-01,A1,10000,120,100000,8,200000`;
}
