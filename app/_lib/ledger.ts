// app/_lib/ledger.ts
export type LedgerRow = {
  date: string
  mission: string
  type: 'daily'|'weekly'|'monthly'
  stable: number
  edge: number
  note?: string
  lock_until?: string
}

const KEY = 'ledger' // localStorage CSV

// CSV 도우미
function toCsvLine(r: LedgerRow){
  const cells = [r.date, r.mission, r.type, r.stable, r.edge, (r.note||''), (r.lock_until||'')]
  return cells.map(String).join(',')
}
function header(){
  return 'date,mission,type,stable,edge,note,lock_until'
}

export function appendLedger(r: LedgerRow){
  const now = localStorage.getItem(KEY)
  if(!now || now.trim()===''){
    localStorage.setItem(KEY, header()+'\n'+toCsvLine(r))
  }else{
    localStorage.setItem(KEY, now + '\n' + toCsvLine(r))
  }
}

export function lastTimeKey(key: string){
  const v = Number(localStorage.getItem('t:'+key) || 0)
  return isNaN(v)? 0 : v
}
export function markTime(key: string){
  localStorage.setItem('t:'+key, String(Date.now()))
}
