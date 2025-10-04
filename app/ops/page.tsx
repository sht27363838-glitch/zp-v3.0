'use client'
import { useEffect, useState } from 'react'
import SimpleTable from '../_components/SimpleTable'
import { loadCSV } from '../_lib/csv'

export default function C5(){
  const [ret,setRet]=useState<any[]>([])
  useEffect(()=>{loadCSV('returns.csv').then(setRet)},[])
  return <div>
    <div className='card'><b>C5 운영 — 반품 데이터(샘플)</b></div>
    <SimpleTable rows={ret}/>
  </div>
}
