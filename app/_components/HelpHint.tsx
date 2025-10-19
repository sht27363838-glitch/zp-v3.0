'use client'
import React from 'react'

export default function HelpHint({text}:{text:string}){
  const [on,setOn] = React.useState(false)
  return (
    <div style={{margin:'8px 0 12px'}}>
      <button className="badge" onClick={()=>setOn(v=>!v)} aria-pressed={on}>
        {on? '도움말 닫기' : '무엇을 보면 좋나요?'}
      </button>
      {on && <div className="card" style={{marginTop:6}}>{text}</div>}
    </div>
  )
}
