'use client'
import { useEffect, useState } from 'react'
import SimpleTable from '../_components/SimpleTable'
import { loadCSV } from '../_lib/csv'

export default function C4(){
  const [ledger,setLedger]=useState<any[]>([])
  useEffect(()=>{loadCSV('ledger.csv').then(setLedger)},[])
  return <div>
    <div className='card'><b>C4 보상엔진 — 누적 원장 미리보기</b></div>
    <SimpleTable rows={ledger}/>
  </div>
}
