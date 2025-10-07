// app/_lib/kpi.ts
import { CsvTable, CsvRow, parseCsv } from './readCsv';
import { num } from './num';

export type NormRow = {
  date?: string;
  channel?: string;
  visits: number;
  clicks: number;
  carts: number;
  orders: number;
  revenue: number;
  ad_cost: number;
  returns: number;
  reviews: number;
};

// CSV 문자열 → 정규화 행[]
export function computeKpiRows(raw: string): NormRow[] {
  const table: CsvTable = parseCsv(raw || '');
  return table.rows.map((r: CsvRow) => ({
    date: String(r.date ?? ''),
    channel: String(r.channel ?? ''),
    visits: num(r.visits),
    clicks: num(r.clicks),
    carts: num(r.carts),
    orders: num(r.orders),
    revenue: num(r.revenue),
    ad_cost: num(r.ad_cost),
    returns: num(r.returns),
    reviews: num(r.reviews),
  }));
}

export type KpiAgg = {
  total: {
    visits: number;
    clicks: number;
    carts: number;
    orders: number;
    revenue: number;
    ad_cost: number;
    returns: number;
    reviews: number;
  };
  ROAS: number;
  CR: number;
  AOV: number;
  ReturnsRate: number;
};

// 선택적으로 최근 N일만 골라내기
export function lastNDays(rows: NormRow[], n?: number): NormRow[] {
  if (!n || n <= 0) return rows;
  const byDate = [...rows].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
  return byDate.slice(-n);
}

// 시계열 뽑기: metric은 'revenue' | 'returns' | 'visits' 등
export function series(rows: NormRow[], metric: keyof NormRow, n?: number): number[] {
  const picked = lastNDays(rows, n);
  return picked.map((r) => Number((r as any)[metric] || 0));
}

// 합계/파생 KPI
export function summarize(rows: NormRow[], n?: number): KpiAgg {
  const picked = lastNDays(rows, n);
  let visits = 0,
    clicks = 0,
    carts = 0,
    orders = 0,
    revenue = 0,
    ad_cost = 0,
    returns = 0,
    reviews = 0;
  for (const r of picked) {
    visits += r.visits;
    clicks += r.clicks;
    carts += r.carts;
    orders += r.orders;
    revenue += r.revenue;
    ad_cost += r.ad_cost;
    returns += r.returns;
    reviews += r.reviews;
  }
  const ROAS = ad_cost ? revenue / ad_cost : 0;
  const CR = visits ? orders / visits : 0;
  const AOV = orders ? revenue / orders : 0;
  const ReturnsRate = orders ? returns / orders : 0;
  return { total: { visits, clicks, carts, orders, revenue, ad_cost, returns, reviews }, ROAS, CR, AOV, ReturnsRate };
}
