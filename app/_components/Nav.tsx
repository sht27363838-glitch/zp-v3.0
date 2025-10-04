
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const tabs:[string,string][]= [['/','C0 지휘소'],['/growth','C1 유입'],['/commerce','C2 전환'],['/rewards','C4 보상엔진'],['/ops','C5 운영'],['/experiments','C6 실험'],['/decisions','DQ 결정큐'],['/data','데이터'],['/report','주간리포트'],['/tools','도구']]
export default function Nav(){
  const p = usePathname()||'/'
  return <div className='nav'>{tabs.map(([href,label])=><Link key={href} href={href} className={'tab '+(p===href?'active':'')}>{label}</Link>)}</div>
}
