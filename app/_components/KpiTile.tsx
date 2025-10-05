'use client'
import React from 'react';

export default function KpiTile({label, value, note, onClick}:{label:string; value:string; note?:string; onClick?:()=>void}){
  return (
    <button className="kpi-tile" onClick={onClick}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {note ? <div className="kpi-note">{note}</div> : null}
      <style jsx>{`
        .kpi-tile{display:flex;flex-direction:column;gap:6px;align-items:flex-start;
          background:var(--panel);border:1px solid var(--border);border-radius:14px;
          padding:14px 16px; text-align:left; cursor:pointer}
        .kpi-label{color:var(--muted);font-size:12px}
        .kpi-value{font-size:22px;font-weight:700}
        .kpi-note{font-size:12px;color:var(--muted)}
        .kpi-tile:hover{outline:2px solid var(--accent); outline-offset:0}
        .kpi-tile:focus-visible{outline:3px solid var(--accent)}
      `}</style>
    </button>
  );
}
