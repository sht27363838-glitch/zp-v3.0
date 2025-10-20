'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const tabs = [
  { href: '/',        label: '지휘소' },
  { href: '/growth',  label: '유입'   },
  { href: '/convert', label: '전환'   },
  { href: '/reward',  label: '보상'   },
  { href: '/report',  label: '리포트' },
  { href: '/tools',   label: '도구'   },
]

export default function Nav() {
  const path = usePathname()
  const [theme, setTheme] = React.useState<'light'|'dark'>('dark')

  // 최초 로드: 저장된 테마 → 문서에 반영
  React.useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light'|'dark'|null) ?? null
    const initial = saved ?? 'dark'
    setTheme(initial)
    document.documentElement.dataset.theme = initial
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
  }

  return (
    <nav className="nav">
      <ul>
        {tabs.map(t => (
          <li key={t.href} className={path === t.href ? 'active' : ''}>
            <Link href={t.href}>{t.label}</Link>
          </li>
        ))}

        <li style={{marginLeft:'auto'}}>
          <button className="badge" onClick={toggleTheme} aria-label="테마 전환">
            테마: {theme === 'dark' ? '다크' : '라이트'}
          </button>
        </li>
      </ul>
    </nav>
  )
}
