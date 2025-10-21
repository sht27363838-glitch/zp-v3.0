'use client'
import React from 'react'
import { usePathname } from 'next/navigation'

export default function Nav(){
  const path = usePathname()
  const [theme, setTheme] = React.useState<'light'|'dark'>(()=>{
    if (typeof window==='undefined') return 'dark'
    return (localStorage.getItem('theme') as 'light'|'dark') || 'dark'
  })
  React.useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  },[theme])

  const tabs = [
    { href: '/', label: '홈' },
    { href: '/growth', label: '유입' },
    { href: '/report', label: '리포트' },
    { href: '/convert', label: '전환' },
    { href: '/rewards', label: '보상' },
    { href: '/tools', label: '도구' },
  ]

  return (
    <nav className="nav">
      <ul>
        {tabs.map(t=>(
          <li key={t.href} className={path===t.href ? 'active' : ''}>
            <a href={t.href}>{t.label}</a>
          </li>
        ))}
        <li style={{marginLeft:'auto'}}>
          <button
            className="btn"
            onClick={()=> setTheme(prev=> prev==='dark' ? 'light' : 'dark')}
            aria-label="테마 전환"
            title="테마 전환"
          >
            {theme==='dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </li>
      </ul>
    </nav>
  )
}

