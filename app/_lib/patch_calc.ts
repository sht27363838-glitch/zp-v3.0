
export type KPI = {date:string, channel:string, visits:number, clicks:number, carts:number, orders:number, revenue:number, ad_cost:number, returns:number, reviews:number}
export type Ledger = {date:string, quest_id:string, type:string, stable_amt:number, edge_amt:number, lock_until:string, proof_url:string}
export function num(n:any){ const x = Number(n); return isFinite(x)? x: 0 }
export const fmt = { n:(v:number)=> v.toLocaleString(), pct:(v:number)=> (isFinite(v)? (v*100).toFixed(1)+'%':'–') }
export function groupBy<T>(arr:T[], key:(t:T)=>string){ const m:Record<string,T[]>={}; arr.forEach(a=>{const k=key(a); (m[k] ||= []).push(a)}); return m }
export function sum(arr:number[]){ return arr.reduce((a,b)=>a+b,0) }
export function computeKpi(kpis:KPI[]){
  const total = kpis.reduce((acc, r)=>{
    acc.visits += num(r.visits); acc.clicks += num(r.clicks); acc.carts += num(r.carts);
    acc.orders += num(r.orders); acc.revenue += num(r.revenue); acc.ad_cost += num(r.ad_cost);
    acc.returns += num(r.returns); acc.reviews += num(r.reviews); return acc
  }, {visits:0, clicks:0, carts:0, orders:0, revenue:0, ad_cost:0, returns:0, reviews:0})
  const CR = total.visits? total.orders/total.visits : 0
  const AOV = total.orders? total.revenue/total.orders : 0
  const ROAS = total.ad_cost? total.revenue/total.ad_cost : 0
  const retRate = total.orders? total.returns/total.orders : 0
  return {total, CR, AOV, ROAS, retRate}
}
export function deltaRatio(cur:number, prev:number){ if(!isFinite(cur) || !isFinite(prev) || prev===0) return 0; return (cur-prev)/prev }
export function capUsed(ledger:Ledger[], lastMonthProfit:number, capRatio:number){
  const used = sum(ledger.map(l=> num((l as any).stable_amt)+num((l as any).edge_amt)))
  const cap = lastMonthProfit * capRatio
  return { used, cap, ratio: cap? used/cap : 0 }
}
export function daysLeft(iso:string){ const t = Date.parse(iso); if(!isFinite(t)) return 0; const ms = t - Date.now(); return Math.ceil(ms/86400000) }
export function decisionGate({ROAS, AOV, CPA, CTR}:{ROAS:number, AOV:number, CPA:number, CTR:number}){
  const scale = ROAS>=2.3 && CPA<=AOV*0.30 && CTR>=0.012
  const keep  = (!scale) && (ROAS>=1.7 || CPA<=AOV*0.35)
  const kill  = !scale && !keep
  return scale? 'SCALE' : keep? 'KEEP' : 'KILL'
}
