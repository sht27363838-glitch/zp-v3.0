export default function KpiCard({label, value, suffix}:{label:string, value:number|string, suffix?:string}){
  return <div className='card kpi'>
    <div className='name'>{label}</div>
    <div className='val'>{typeof value==='number' ? (Number.isFinite(value)? value.toLocaleString(): '0') : value}{suffix||''}</div>
  </div>
}
