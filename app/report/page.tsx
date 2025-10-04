
'use client'
import React from 'react'
import { loadCSV } from '../_lib/patch_loader'
import { computeKpi, fmt } from '../_lib/patch_calc'

export default function Report(){
  const [sum,setSum] = React.useState<any>(null)
  React.useEffect(()=>{
    (async()=>{
      const kpi = await loadCSV('kpi_daily.csv')
      const k = computeKpi(kpi as any)
      const CPA = k.total.orders? k.total.ad_cost/k.total.orders : 0
      const line1 = `상태: ROAS ${k.ROAS.toFixed(2)}, CR ${(k.CR*100).toFixed(2)}%, AOV ${fmt.n(Math.round(k.AOV))}`
      const line2 = `판단: CAC=${fmt.n(Math.round(CPA))}, 리스크(반품) ${(k.retRate*100).toFixed(1)}%`
      const line3 = `지시: 승자 유지, 실패 세트 Kill, 내주 실험 1건`
      setSum({line1,line2,line3})
    })()
  },[])
  const printNow = ()=> window.print()
  return <div className='container'>
    <div className='card'>
      <h3>주간 리포트</h3>
      <div className='mono' style={{whiteSpace:'pre-wrap'}}>
        {(sum&&[sum.line1,sum.line2,sum.line3].join('\n')) || '요약 준비 중…'}
      </div>
      <div style={{marginTop:12}}>
        <button className='badge primary' onClick={printNow}>PDF 내보내기</button>
      </div>
    </div>
  </div>
}
