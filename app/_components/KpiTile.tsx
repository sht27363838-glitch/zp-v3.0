'use client';
type Props={label:string; value:string; tone?:'plain'|'good'|'warn'|'bad'}
export default function KpiTile({label,value,tone='plain'}:Props){
  return(<div className={'kpi '+tone}>
    <div className='kpi-label'>{label}</div>
    <div className='kpi-value'>{value}</div>
    <style jsx>{`
      .kpi{min-width:150px;padding:12px 14px;border-radius:14px;border:1px solid var(--border);background:#161A1E}
      .kpi-label{font-size:.9rem;color:var(--muted)}
      .kpi-value{font-size:1.35rem;font-weight:800;color:#E6EAF0}
      .kpi.good{box-shadow:inset 0 0 0 1px rgba(34,197,94,.35)}
      .kpi.warn{box-shadow:inset 0 0 0 1px rgba(245,158,11,.35)}
      .kpi.bad{ box-shadow:inset 0 0 0 1px rgba(239,68,68,.35)}
    `}</style>
  </div>);
}
