'use client';
import { readCsvFromLocal } from '../_lib/readCsv';
import { num, fmt } from '../_lib/num';

type P={x:number;y:number};
const Steps=({pts,color}:{pts:P[],color:string})=>{
  if(pts.length<2) return null;
  const d:string[]=[];
  for(let i=0;i<pts.length-1;i++){const a=pts[i], b=pts[i+1]; d.push(`M ${a.x} ${a.y} H ${b.x} V ${b.y}`);}
  return <path d={d.join(' ')} fill='none' stroke={color} strokeWidth={2}/>;
};

export default function Rewards(){
  const rows = readCsvFromLocal('ledger');
  const by:Record<string,{s:number;e:number}> = {};
  for(const r of rows){
    const d=(r.date||'').slice(0,10); if(!d) continue;
    (by[d]??={s:0,e:0}); by[d].s+=num(r.stable_amt); by[d].e+=num(r.edge_amt);
  }
  const dates=Object.keys(by).sort();
  let accS=0, accE=0;
  const data = dates.map(d=>({date:d, s:(accS+=by[d].s), e:(accE+=by[d].e)}));
  const W=760,H=220,pad=20;
  const maxY=Math.max(1,...data.map(d=>Math.max(d.s,d.e)));
  const sx=(i:number)=> pad+(W-2*pad)*(i/Math.max(1,data.length-1));
  const sy=(v:number)=> H-pad-(H-2*pad)*(v/maxY);
  const sPts=data.map((d,i)=>({x:sx(i),y:sy(d.s)})), ePts=data.map((d,i)=>({x:sx(i),y:sy(d.e)}));

  const totalS=data.at(-1)?.s||0, totalE=data.at(-1)?.e||0;
  const share=(totalS+totalE)? totalE/(totalS+totalE):0;

  return (
    <div className='stack'>
      <section className='card'>
        <h2>C4 보상엔진 — 적립 타임라인</h2>
        {!rows.length && <p className='badge warn'>ledger CSV 업로드 필요(도구 탭)</p>}
        {!!rows.length && <>
          <svg width='100%' viewBox={`0 0 ${W} ${H}`} style={{background:'#11161a',border:'1px solid var(--border)',borderRadius:12}}>
            <Steps pts={sPts} color='#22C55E'/><Steps pts={ePts} color='#0EA5E9'/>
          </svg>
          <div className='row gap' style={{marginTop:10}}>
            <span className='badge success'>안정 누적 {fmt(totalS)}</span>
            <span className='badge info'>엣지 누적 {fmt(totalE)}</span>
            <span className={share>0.30?'badge danger':'badge'}>엣지 비중 {(share*100).toFixed(1)}%</span>
          </div>
        </>}
      </section>
      {!!rows.length && <section className='card'><h3>락업 예정</h3>
        <div className='row gap' style={{flexWrap:'wrap'}}>
          {rows.filter((r:any)=>r.lock_until).slice(0,20).map((r:any,i:number)=>
            <span key={i} className='badge info'>{r.lock_until} 락업</span>
          )}
        </div>
      </section>}
    </div>
  );
}
