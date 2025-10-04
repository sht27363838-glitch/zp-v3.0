export type Row = Record<string,string>
const REQUIRED: Record<string,string[]> = {
  'kpi_daily.csv': ['date','channel','visits','clicks','carts','orders','revenue','ad_cost'],
  'ledger.csv': ['date','quest_id','type','stable_amt','edge_amt'],
  'commerce_items.csv': ['date','order_id','sku','qty','price','source'],
  'returns.csv': ['order_id','sku','reason','date'],
  'settings.csv': ['last_month_profit','cap_ratio','edge_min','edge_max']
}
export function parseCSV(text:string): Row[] {
  const lines=text.trim().split(/\r?\n/); if(lines.length===0) return []
  const head=lines[0].split(',').map(h=>h.trim()); const rows:Row[]=[]
  for(let i=1;i<lines.length;i++){ const cols=lines[i].split(',').map(c=>c.trim()); const obj:Row={}
    head.forEach((h,idx)=> obj[h]= (cols[idx]??'')); rows.push(obj) }
  return rows
}
function normalizeLink(url:string){ const g=url.match(/https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\//); if(g){return `https://drive.google.com/uc?export=download&id=${g[1]}`} if(url.includes('dropbox.com')){ try{const u=new URL(url); u.searchParams.set('dl','1'); return u.toString()}catch{} } return url }
function toast(text:string, type:'info'|'success'|'warn'|'danger'='warn'){ if(typeof window==='undefined') return; window.dispatchEvent(new CustomEvent('toast',{detail:{text,type}})) }
function validateHeaders(filename:string, rows:Row[]){ const req=REQUIRED[filename]; if(!req||rows.length===0) return; const present=new Set(Object.keys(rows[0])); const missing=req.filter(h=>!present.has(h)); if(missing.length>0){ toast(`${filename} 헤더 누락: ${missing.join(', ')}`,'danger'); console.warn('[CSV validate]',filename,'missing:',missing) } }
export async function loadCSV(filename:string): Promise<Row[]>{ const envMapping=process.env.ZP_DATA_SOURCES||''; const envMap:Record<string,string>={}; envMapping.split(',').forEach(pair=>{const [k,v]=pair.split('='); if(k&&v) envMap[k.trim()]=v.trim()})
  const fileKey=filename.split('/').pop()||filename; const tryUrls:string[]=[]
  if(envMap[fileKey]) tryUrls.push(normalizeLink(envMap[fileKey]))
  if(typeof window!=='undefined'){ const raw=localStorage.getItem('zp_data_sources'); if(raw){ const map=JSON.parse(raw) as Record<string,string>; if(map[fileKey]) tryUrls.push(normalizeLink(map[fileKey])) } }
  tryUrls.push(`/data/${fileKey}`)
  for(const u of tryUrls){ try{ const res=await fetch(u); if(!res.ok) continue; const txt=await res.text(); const rows=parseCSV(txt); validateHeaders(fileKey, rows); return rows }catch(e){ if(typeof window!=='undefined'){ toast(`${fileKey} 로드 실패`,'danger') } } }
  return []
}