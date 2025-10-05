// app/_lib/kpi.ts
import { parseCsv } from './readCsv';
import { num } from './num';

export function computeKpiRows(raw: string){
  const rows = parseCsv(raw||'');
  return rows.map(r=>({
    date: r.date,
    visits: num(r.visits),
    clicks: num(r.clicks),
    carts: num(r.carts),
    orders: num(r.orders),
    revenue: num(r.revenue),
    ad_cost: num(r.ad_cost),
    returns: num(r.returns||0),
  }));
}

export function summarize(rows: ReturnType<typeof computeKpiRows>){
  const t = rows.reduce((a,r)=>({
    visits:a.visits+r.visits, clicks:a.clicks+r.clicks, carts:a.carts+r.carts,
    orders:a.orders+r.orders, revenue:a.revenue+r.revenue,
    ad_cost:a.ad_cost+r.ad_cost, returns:a.returns+r.returns
  }), {visits:0,clicks:0,carts:0,orders:0,revenue:0,ad_cost:0,returns:0});
  const CR = t.visits? t.orders/t.visits : 0;
  const AOV = t.orders? t.revenue/t.orders : 0;
  const ROAS = t.ad_cost? t.revenue/(t.ad_cost||1) : 0;
  const ReturnsRate = t.orders? t.returns/t.orders : 0;
  return {total:t, CR, AOV, ROAS, ReturnsRate};
}

export function lastNDays(rows: ReturnType<typeof computeKpiRows>, n:number){
  return rows.slice(-n);
}

export function series(rows: ReturnType<typeof computeKpiRows>, key: keyof ReturnType<typeof computeKpiRows>[number]){
  return rows.map(r=> Number(r[key]||0));
}
