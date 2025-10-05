'use client';
import React from 'react';

export default function KpiTile({
  label, value, tone,
}: { label: string; value: string | number; tone?: 'good'|'warn'|'bad'|undefined }) {
  const toneClass = tone==='good' ? 'good' : tone==='warn' ? 'warn' : tone==='bad' ? 'bad' : '';
  return (
    <div className={`kpi-tile ${toneClass}`}>
      <div className='kpi-label'>{label}</div>
      <div className='kpi-value'>{value}</div>
      <style jsx>{`
        .kpi-tile{min-width:150px;padding:12px 14px;border-radius:12px;background:#161A1E;border:1px solid #232A31}
        .kpi-label{font-size:12px;color:#9BA7B4;margin-bottom:6px}
        .kpi-value{font-size:20px;font-weight:700;color:#E6EAF0}
        .kpi-tile.good{box-shadow:0 0 0 1px #22C55E22 inset}
        .kpi-tile.warn{box-shadow:0 0 0 1px #F59E0B22 inset}
        .kpi-tile.bad{ box-shadow:0 0 0 1px #EF444422 inset}
      `}</style>
    </div>
  );
}
