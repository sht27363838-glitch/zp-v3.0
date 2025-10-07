'use client'
export default function AovWaterfall({carts, orders, revenue}:{carts:number; orders:number; revenue:number}){
  const aov = orders? revenue/orders : 0
  const steps = [
    {label:'장바구니', value:carts},
    {label:'주문', value:orders},
    {label:'매출', value:revenue},
  ]
  return (
    <div className="flex gap-2">
      {steps.map((s,i)=>(
        <div key={i} className="card" style={{minWidth:160}}>
          <div className="text-sm muted">{s.label}</div>
          <div className="text-xl">{format(s.value)}</div>
        </div>
      ))}
      <div className="card" style={{minWidth:160}}>
        <div className="text-sm muted">AOV</div>
        <div className="text-xl">{format(aov)}</div>
      </div>
    </div>
  )
}
const format = (v:number)=> v.toLocaleString()
