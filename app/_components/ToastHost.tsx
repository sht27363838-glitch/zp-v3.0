'use client'
import React from 'react'
type Toast = { id: number, text: string, type?: 'info'|'success'|'warn'|'danger' }
export default function ToastHost(){
  const [toasts,setToasts] = React.useState<Toast[]>([])
  React.useEffect(()=>{
    function onToast(e: any){
      const d = e.detail||{}
      const t: Toast = { id: Date.now()+Math.random(), text: String(d.text||''), type: d.type||'info' }
      setToasts(p=>[...p,t]); setTimeout(()=> setToasts(p=> p.filter(x=>x.id!==t.id)), d.ttl||4000)
    }
    window.addEventListener('toast', onToast as any)
    return ()=> window.removeEventListener('toast', onToast as any)
  },[])
  return (<div style={{position:'fixed', right:12, bottom:12, display:'flex', flexDirection:'column', gap:8, zIndex:1000}}>
    {toasts.map(t=> <div key={t.id} className={`badge ${t.type||'info'}`} style={{boxShadow:'0 6px 22px rgba(0,0,0,.35)'}}>{t.text}</div>)}
  </div>)
}