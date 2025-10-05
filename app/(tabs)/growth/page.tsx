'use client';
import { readCsvFromLocal } from '../_lib/readCsv';
import { num, fmt } from '../_lib/num';

export default function Growth(){
  const kpi = readCsvFromLocal('kpi_daily');
  const by: any = {};
  for(const r of kpi){
    const ch = r.channel || 'unknown';
    by[ch] ??= {channel:ch, clicks:0, spend:0, orders:0, revenue:0};
    by[ch].clicks+=num(r.clicks); by[ch].spend+=num(r.ad_cost); by[ch].orders+=num(r.orders); by[ch].revenue+=num(r.revenue);
  }
  const rows = Object.values(by).map((r:any)=>{
    const AOV = r.orders? r.revenue/r.orders : 0;
    const ROAS= r.spend?  r.revenue/r.spend : 0;
    const CPA = r.orders? r.spend/r.orders   : 0;
    const scale = ROAS>=2.3 && CPA<=AOV*0.30;
    const keep  = !scale && (ROAS>=1.7 || CPA<=AOV*0.35);
    const action = scale?'SCALE': keep?'KEEP':'KILL';
    return {...r, ROAS, CPA, AOV, action};
  }).sort((a:any,b:any)=> b.ROAS-a.ROAS);

  return (
    <div className='stack'>
      <section className='card'>
        <h2>C1 유입 — 채널 리그</h2>
        {!rows.length && <p className='badge warn'>kpi_daily CSV 업로드 필요(도구 탭)</p>}
        {!!rows.length && (
          <div className='table-wrap'>
            <table>
              <thead><tr><th>채널</th><th className='num'>ROAS</th><th className='num'>CPA</th><th className='num'>AOV</th><th>권고</th></tr></thead>
              <tbody>
                {rows.map((r:any)=>(
                  <tr key={r.channel}>
                    <td>{r.channel}</td>
                    <td className='num'>{fmt(r.ROAS)}</td>
                    <td className='num'>{fmt(r.CPA)}</td>
                    <td className='num'>{fmt(r.AOV)}</td>
                    <td>{r.action==='SCALE'?<span className='badge success'>SCALE</span>:r.action==='KEEP'?<span className='badge info'>KEEP</span>:<span className='badge danger'>KILL</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
