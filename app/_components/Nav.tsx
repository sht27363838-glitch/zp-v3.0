// app/_components/Nav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// app/_components/Nav.tsx (일부)
const tabs = [
  { label: '지휘소', href: '/' },
  { label: '유입',   href: '/growth' },
  { label: '전환',   href: '/commerce' },  
  { label: '보상',   href: '/rewards' },
  { label: '리포트', href: '/report' },
  { label: '도구',   href: '/tools' },
]


export default function Nav() {
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

