'use client';

import { readCsvFromLocal } from '../../_lib/readCsv';
import { num, fmt, pct } from '../../_lib/num';

export default function RewardsPage(){
  const ledger = readCsvFromLocal('ledger');

  const totalStable = ledger.reduce((s:any,r:any)=> s + num(r.stable_amt), 0);
  const totalEdge   = ledger.reduce((s:any,r:any)=> s + num(r.edge_amt), 0);
  const total = totalStable + totalEdge;
  const edgeShare = total ? totalEdge/total : 0;

  // 간단 락업 테이블
  return (
    <div className="stack">
      <section className="card">
        <h2>C4 보상 엔진</h2>
        <div className="row gap wrap">
          <div className="kpi"><div className="lab">안정 누적</div><div className="val">{fmt(totalStable)}</div></div>
          <div className="kpi"><div className="lab">엣지 누적</div><div className="val">{fmt(totalEdge)}</div></div>
          <div className="kpi"><div className="lab">총 보상</div><div className="val">{fmt(total)}</div></div>
          <div className="kpi"><div className="lab">엣지 비중</div><div className="val">{pct(edgeShare)}</div></div>
        </div>
      </section>

      <section className="card">
        <h3>트랜잭션</h3>
        {!ledger.length && <p className="badge warn">ledger.csv 업로드 필요(도구 탭)</p>}
        {!!ledger.length && (
          <div className='table-wrap'>
            <table>
              <thead>
                <tr>
                  <th>날짜</th><th>미션</th><th>유형</th>
                  <th className='num'>안정</th><th className='num'>엣지</th><th>락업</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((r:any, i:number)=>(
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.quest_id}</td>
                    <td>{r.type}</td>
                    <td className='num'>{fmt(num(r.stable_amt))}</td>
                    <td className='num'>{fmt(num(r.edge_amt))}</td>
                    <td>{r.lock_until || '-'}</td>
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
