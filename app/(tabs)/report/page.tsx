'use client';
import { readCsvFromLocal } from '../_lib/readCsv';
import { num, fmt, pct } from '../_lib/num';
import KpiTile from '../_components/KpiTile';

export default function ReportPage(){
  const kpi = readCsvFromLocal('kpi_daily');
  const ledger = readCsvFromLocal('ledger');

  const A = kpi.reduce((a:any,r:any)=>({
    visits:a.visits+num(r.visits), clicks:a.clicks+num(r.clicks),
    carts:a.carts+num(r.carts), orders:a.orders+num(r.orders),
    revenue:a.revenue+num(r.revenue), ad_cost:a.ad_cost+num(r.ad_cost),
    returns:a.returns+num(r.returns), reviews:a.reviews+num(r.reviews)
  }),{visits:0,clicks:0,carts:0,orders:0,revenue:0,ad_cost:0,returns:0,reviews:0});

  const ROAS=A.ad_cost?A.revenue/A.ad_cost:0, CR=A.visits?A.orders/A.visits:0, AOV=A.orders?A.revenue/A.orders:0, RR=A.orders?A.returns/A.orders:0;
  const reward = ledger.reduce((s:any,r:any)=> s+num(r.stable_amt)+num(r.edge_amt), 0);

  const state = `ROAS ${fmt(ROAS)} / CR ${pct(CR)} / AOV ${fmt(AOV)}`;
  const judge = ROAS>=2.3 && CR>=0.012 ? '상태 양호' : (ROAS>=1.7?'보수 유지':'효율 저하');
  const order = ROAS>=2.3 ? '승자 예산 +20%' : (ROAS>=1.7 ? '유지 / 소재 교체' : '비효율 중지');

  return (
    <div className='stack'>
      <section className='card'>
        <h2>주간 리포트</h2>
        <div className='row gap' style={{flexWrap:'wrap',marginTop:10}}>
          <KpiTile label='매출' value={fmt(A.revenue)} />
          <KpiTile label='ROAS' value={fmt(ROAS)} tone={ROAS>=2.3?'good':ROAS>=1.7?'warn':'bad'}/>
          <KpiTile label='CR' value={pct(CR)} tone={CR>=0.012?'good':'warn'}/>
          <KpiTile label='AOV' value={fmt(AOV)} />
          <KpiTile label='반품률' value={pct(RR)} tone={RR<=0.03?'good':'bad'}/>
          <KpiTile label='보상총액' value={fmt(reward)} />
        </div>
      </section>
      <section className='card'>
        <h3>상태 → 판단 → 지시</h3>
        <p className='badge info'>{state}</p>
        <p className='badge warn'>{judge}</p>
        <p className='badge success'>{order}</p>
      </section>
      {!kpi.length && <section className='card'><p className='badge warn'>kpi_daily CSV를 먼저 업로드하세요(도구 탭).</p></section>}
    </div>
  );
}
