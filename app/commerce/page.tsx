'use client'
import { useEffect, useState } from 'react'
import SimpleTable from '../_components/SimpleTable'
import { loadCSV } from '../_lib/csv'

export default function C2(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{loadCSV('commerce_items.csv').then(setItems)},[])
  return <div>
    <div className='card'><b>C2 전환 — 샘플(워터폴/히트맵은 v2.x와 동일 로직 이관 예정)</b></div>
    <SimpleTable rows={items}/>
  </div>
}
