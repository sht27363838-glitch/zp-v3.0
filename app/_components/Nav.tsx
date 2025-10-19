// app/_components/Nav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@cmp/ThemeToggle'

const tabs = [
  { href: '/',         label: '지휘소' },
  { href: '/growth',   label: '유입' },
  { href: '/commerce', label: '전환' },
  { href: '/reward',   label: '보상' },
  { href: '/report',   label: '리포트' },
  { href: '/tools',    label: '도구' },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="nav">
      <ul style={{ justifyContent:'space-between' }}>
        <li>
          <ul style={{ display:'flex', gap:16, alignItems:'center', listStyle:'none', margin:0, padding:0 }}>
            {tabs.map(t => (
              <li key={t.href} className={path === t.href ? 'active' : ''}>
                <Link href={t.href}>{t.label}</Link>
              </li>
            ))}
          </ul>
        </li>
        <li><ThemeToggle/></li>
      </ul>
    </nav>
  )
}


