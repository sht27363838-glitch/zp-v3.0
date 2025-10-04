
export async function loadCSV(path:string){
  try{
    const mod = await import('../_lib/csv')
    if(mod && typeof (mod as any).loadCSV === 'function'){
      return (mod as any).loadCSV(path)
    }
  }catch{}
  const url = path.startsWith('http') ? path : `/data/${path}`
  const res = await fetch(url); const text = await res.text()
  const [head, ...rows] = text.trim().split(/\r?\n/)
  const cols = head.split(',')
  return rows.map(r=>{
    const c = r.split(','); const o:any = {}
    cols.forEach((k,i)=> o[k] = c[i]); return o
  })
}
