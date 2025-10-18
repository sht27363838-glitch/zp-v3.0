'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export default function useQueryState<T extends Record<string,string|undefined>>(init:T){
  const router = useRouter()
  const sp = useSearchParams()
  const state = useMemo(()=>{
    const out:any = {...init}
    Object.keys(init).forEach(k => { out[k] = sp.get(k) ?? init[k] })
    return out as T
  }, [sp, init])
  const set = useCallback((patch:Partial<T>)=>{
    const p = new URLSearchParams(sp.toString())
    Object.entries(patch).forEach(([k,v])=>{
      if(v===undefined || v==='') p.delete(k); else p.set(k, String(v))
    })
    router.replace(`?${p.toString()}`)
  }, [router, sp])
  return [state, set] as const
}
