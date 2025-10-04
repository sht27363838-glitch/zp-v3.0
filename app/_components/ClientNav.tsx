'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = { href: string; label: string }

const tabs: Tab[] = [
  { href: '/',           label: '지휘소' },
  { href: '/growth',     label: '유입' },
  { href: '/commerce',   label: '전환' },
  { href: '/rewards',    label: '보상' },
  { href: '/ops',        label: '운영' },
  { href: '/experiments',label: '실험' },
  { href: '/decisions',  label: '결정큐' },
  { href: '/data',       label: '데이터' },
  { href: '/report',     label: '리포트' },
  { href: '/tools',      label: '도구' },
]

export default function ClientNav(){
  const p = usePathname() || '/'
  return (
    <nav className='nav'>
      {tabs.map(t => (
        <Link key={t.href} href={t.href} className={'tab ' + (p === t.href ? 'active' : '')}>
          {t.label}
        </Link>
      ))}
      <style jsx>{`
        .nav { display:flex; gap:8px; flex-wrap:wrap; padding:8px 0; }
        .tab {
          padding:8px 12px; border-radius:10px;
          background:#161A1E; color:#E6EAF0; border:1px solid #232A31;
          font-size:14px; line-height:20px; text-decoration:none;
        }
        .tab:hover { outline:1px solid #0EA5E9; }
        .tab.active {
          background:#0EA5E9; color:#0B1118; border-color:#0EA5E9;
          font-weight:600;
        }
      `}</style>
    </nav>
  )
}
