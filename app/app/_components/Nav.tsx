'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const tabs:[string,string][] = [
  ['/','C0 지휘소'],
  ['/growth','C1 유입'],
  ['/commerce','C2 전환'],
  ['/rewards','C4 보상엔진'],
  ['/ops','C5 운영'],
  ['/experiments','C6 실험'],
  ['/decisions','DQ 결정큐'],
  ['/data','데이터'],
  ['/report','주간리포트'],
  ['/tools','도구'],
]

export default function Nav(){
  const p = usePathname() || '/'
  return <div className='nav'>
    {tabs.map(([href,label])=>
      <Link key={href} href={href} className={'tab '+(p===href?'active':'')}>{label}</Link>
    )}
    <style jsx>{`
      .nav{ position:sticky; top:0; z-index:40; display:flex; gap:8px; padding:10px 16px; 
            border-bottom:1px solid var(--border); background:rgba(15,18,22,.8); backdrop-filter: blur(8px); }
      .tab{ padding:8px 10px; border-radius:10px; color:var(--txt); text-decoration:none; 
            border:1px solid transparent; font-weight:700; font-size:13px; }
      .tab:hover{ border-color:var(--border); background:#13171b; }
      .tab.active{ background:rgba(14,165,233,.14); border-color:#0B7285; color:#E6EAF0; box-shadow:0 0 0 1px rgba(14,165,233,.25) inset; }
      @media (max-width: 960px){
        .nav{ overflow-x:auto; white-space:nowrap; }
      }
    `}</style>
  </div>
}