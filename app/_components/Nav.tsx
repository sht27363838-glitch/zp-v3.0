'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'

// Route-typed tabs (works whether typedRoutes is on or off)
const tabs: ReadonlyArray<readonly [Route, string]> = [
  ['/' as Route, 'C0 지휘소'],
  ['/growth' as Route, 'C1 유입'],
  ['/commerce' as Route, 'C2 전환'],
  ['/rewards' as Route, 'C4 보상엔진'],
  ['/ops' as Route, 'C5 운영'],
  ['/experiments' as Route, 'C6 실험'],
  ['/decisions' as Route, 'DQ 결정큐'],
  ['/data' as Route, '데이터'],
  ['/report' as Route, '주간리포트'],
  ['/tools' as Route, '도구'],
]

export default function Nav(){
  const p = usePathname() || '/'
  return (
    <div className='nav'>
      {tabs.map(([href,label]) => (
        <Link key={href} href={href} className={'tab ' + (p===href ? 'active' : '')}>
          {label}
        </Link>
      ))}
    </div>
  )
}
