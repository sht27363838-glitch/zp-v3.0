
'use client'
import React from 'react'
import { loadCSV } from '../_lib/patch_loader'
import { fmt, num } from '../_lib/patch_calc'

// HOTFIX: 숫자 필드는 전부 '필수'로 타입 선언하여 undefined 경고 제거
type Row = { channel:string, clicks:number, spend:number, orders:number, revenue:number }

export default function Growth(){
  const [rows,setRows] = React.useState<Row[]>([])
  const [top,setTop] = React.useState(false)
  React.useEffect(()=>{
    (async()=>{
      const kpi:any[] = await loadCSV('kpi_daily.csv')
      const by:Record<string, Row> = {}
      for(const r of kpi){
        const ch = r.channel || 'unknown'
        const o:Row = (by[ch] ||= {channel: ch, clicks:0, spend:0, orders:0, revenue:0})
        o.clicks = o.clicks + num(r.clicks)
        o.spend  = o.spend  + num(r.ad_cost)
        o.orders = o.orders + num(r.orders)
        o.revenue= o.revenue+ num(r.revenue)
      }
      const list = Object.values(by).map((r:Row)=>{
        const CPA = r.orders? (r.spend||0)/r.orders : 0
        const ROAS = (r.spend||0)? (r.revenue||0)/r.spend : 0
        const CVR = (r.clicks||0)? (r.orders||0)/(r.clicks||1):0
        return {...r, CPA, ROAS, CVR}
      }).sort((a:any,b:any)=> (b.ROAS||0) - (a.ROAS||0))
      setRows(list as any)
    })()
  },[])
  const view:any[] = top ? (rows as any).slice(0, Math.max(1, Math.ceil(rows.length*0.2))) : (rows as any)
  return <div className='container'>
    <div className='card'>
      <h3>크리에이티브/채널 리그</h3>
      <label><input type='checkbox' checked={top} onChange={e=>setTop(e.target.checked)} /> 상위 20%만 보기</label>
      <table className='table' style={{marginTop:10}}>
        <thead><tr><th>채널</th><th>클릭</th><th>주문</th><th>Spend</th><th>매출</th><th>ROAS</th><th>CPA</th><th>CVR</th></tr></thead>
        <tbody>
          {view.map((r:any,i:number)=>(
            <tr key={i}>
              <td>{r.channel}</td>
              <td>{fmt.n(r.clicks||0)}</td>
              <td>{fmt.n(r.orders||0)}</td>
              <td>{fmt.n(Math.round(r.spend||0))}</td>
              <td>{fmt.n(Math.round(r.revenue||0))}</td>
              <td>{(r.ROAS||0).toFixed(2)}</td>
              <td>{fmt.n(Math.round(r.CPA||0))}</td>
              <td>{((r.CVR||0)*100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}
