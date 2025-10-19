'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/',        label: '지휘소' },
  { href: '/growth',  label: '유입'   },
  { href: '/convert', label: '전환'   },  // ← 전환 고정
  { href: '/reward',  label: '보상'   },  // ← 보상 고정
  { href: '/report',  label: '리포트' },
  { href: '/tools',   label: '도구'   },
]

export default function Nav(){
  const path = usePathname()
  return (
    <nav className="nav">
      <ul>
        {tabs.map(t => (
          <li key={t.href} className={path === t.href ? 'active' : ''}>
            <Link href={t.href}>{t.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}


