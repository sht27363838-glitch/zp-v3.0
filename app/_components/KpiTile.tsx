'use client'
import React from 'react';

export default function KpiTile({label, value, sub, onClick}:{label:string, value:string, sub?:string, onClick?:()=>void}){
  return (
    <button className="kpi-tile btn ghost" onClick={onClick} aria-label={label}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </button>
  )
}
