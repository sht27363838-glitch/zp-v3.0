'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Tabs (C5 앞, C6 뒤)
const tabs = [
  ['/', 'C0 지휘소'],
  ['/growth', 'C1 유입'],
  ['/commerce', 'C2 전환'],
  ['/rewards', 'C4 보상엔진'],
  ['/ops', 'C5 운영'],
  ['/experiments', 'C6 실험'],
  ['/decisions', 'DQ 결정큐'],
  ['/data', '데이터'],
  ['/report', '주간리포트'],
  ['/tools', '도구'],
] as const

export default function Nav(){
  const p = usePathname()
  return <div className='nav'>
    {tabs.map(([href,label])=> (
      <Link key={href} href={href as any} className={p===href?'active':''}>{label}</Link>
    ))}
  </div>
}
