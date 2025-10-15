'use client'
import Link from 'next/link'
import React, {useMemo} from 'react'
import { getAlertFlags } from '@lib/guards'

export default function Nav(){
  const flags = useMemo(()=> getAlertFlags(), [])
  const dangerOn = flags.roasLow || flags.crDrop || flags.returnsSpike

  const Tab = ({href, children}:{href:string;children:React.ReactNode})=>(
    <li className="nav-item">
      <Link href={href} className="nav-link">{children}</Link>
      {href==='/report' && dangerOn && <span className="dot danger" aria-label="경보"/>}
    </li>
  )

  return (
    <nav className="nav">
      <ul className="nav-list">
        <Tab href="/">지휘소</Tab>
        <Tab href="/growth">유입</Tab>
        <Tab href="/commerce">전환</Tab>
        <Tab href="/report">리포트</Tab>
        <Tab href="/rewards">보상</Tab>
        <Tab href="/tools">도구</Tab>
      </ul>
    </nav>
  )
}
