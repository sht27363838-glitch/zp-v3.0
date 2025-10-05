'use client'
import React from 'react';

export default function Spark({values=[], width=320, height=80}:{values:number[]; width?:number; height?:number}){
  if (!values || values.length===0) return <div style={{height}}/>;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pad = 4;
  const w = width - pad*2;
  const h = height - pad*2;
  const pts = values.map((v,i)=>{
    const x = (i/(values.length-1))*w + pad;
    const y = h - (max===min? 0 : (v-min)/(max-min))*h + pad;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height}>
      <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={pts}/>
    </svg>
  );
}
