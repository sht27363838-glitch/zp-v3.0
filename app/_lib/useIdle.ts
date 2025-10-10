'use client'
import { useEffect, useState } from 'react'

// requestIdleCallback 폴리필
const ric = (cb:Function)=> {
  if (typeof (window as any).requestIdleCallback === 'function')
    return (window as any).requestIdleCallback(cb);
  return setTimeout(()=>cb({}), 150);
}

export default function useIdle(ms=400){
  const [ready,setReady]=useState(false)
  useEffect(()=>{
    const t = setTimeout(()=> ric(()=>setReady(true)), ms)
    return ()=> clearTimeout(t as any)
  },[ms])
  return ready
}

