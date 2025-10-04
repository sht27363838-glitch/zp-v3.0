export type Row = Record<string,string>

export function parseCSV(text:string): Row[] {
  const lines = text.trim().split(/\r?\n/)
  if(lines.length===0) return []
  const head = lines[0].split(',').map(h=>h.trim())
  const rows: Row[]=[]
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].split(',').map(c=>c.trim())
    const obj: Row = {}
    head.forEach((h,idx)=> obj[h] = (cols[idx] ?? ''))
    rows.push(obj)
  }
  return rows
}

function normalizeLink(url: string): string {
  const g = url.match(/https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\//)
  if(g){ return `https://drive.google.com/uc?export=download&id=${g[1]}` }
  if(url.includes('dropbox.com')){
    try{ const u = new URL(url); u.searchParams.set('dl','1'); return u.toString() }catch{}
  }
  return url
}

export async function loadCSV(filename: string): Promise<Row[]> {
  // 1) ENV mapping (server) -> 2) LocalStorage mapping (client) -> 3) public/data fallback
  const envMapping = process.env.ZP_DATA_SOURCES || ''
  const envMap: Record<string,string> = {}
  envMapping.split(',').forEach(pair=>{
    const [k,v] = pair.split('=')
    if(k && v) envMap[k.trim()] = v.trim()
  })
  const fileKey = filename.split('/').pop() || filename

  const tryUrls: string[] = []
  if(envMap[fileKey]) tryUrls.push(normalizeLink(envMap[fileKey]))

  if(typeof window !== 'undefined'){
    const raw = localStorage.getItem('zp_data_sources')
    if(raw){ const map = JSON.parse(raw) as Record<string,string>
      if(map[fileKey]) tryUrls.push(normalizeLink(map[fileKey]))
    }
  }

  tryUrls.push(`/data/${fileKey}`)

  for(const u of tryUrls){
    try{
      const res = await fetch(u)
      if(!res.ok) continue
      const txt = await res.text()
      return parseCSV(txt)
    }catch{}
  }
  return []
}
