'use client'
import React from 'react'
import { usePathname } from 'next/navigation'

const tabs = [
  { name: '지휘소', href: '/' },
  { name: '유입',   href: '/growth' },
  { name: '전환',   href: '/convert' },   // ← 전환 경로를 /convert 로 고정
  { name: '보상',   href: '/reward' },
  { name: '리포트', href: '/report' },
  { name: '도구',   href: '/tools' },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="nav">
      <ul>
        {tabs.map(t => (
          <li key={t.href} className={path === t.href ? 'active' : ''}>
            <a href={t.href}>{t.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
