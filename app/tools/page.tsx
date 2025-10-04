'use client'
import React from 'react'

export default function Tools(){
  const [msg,setMsg] = React.useState<string>('')

  const clearLocal = ()=>{
    localStorage.clear()
    setMsg('로컬 데이터(localStorage)를 모두 삭제했습니다.')
  }
  const setDemo = ()=>{
    localStorage.setItem('last_month_profit','3000000')
    localStorage.setItem('cap_ratio','0.10')
    setMsg('데모 설정을 주입했습니다. (전월 순익=3,000,000 / 캡 10%)')
  }
  const downloadState = ()=>{
    const blob = new Blob([JSON.stringify(localStorage,null,2)], {type:'application/json'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='localStorage-backup.json'; a.click()
  }

  return <div className='container'>
    <div className='card'>
      <h3>도구</h3>
      <p className='footer-muted'>간단한 유틸리티 모음입니다. (v3.1-2 패치와 함께 추가)</p>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:8}}>
        <button className='btn danger' onClick={clearLocal}>로컬 데이터 초기화</button>
        <button className='btn success' onClick={setDemo}>데모 설정 주입</button>
        <button className='btn ghost' onClick={downloadState}>로컬 상태 백업(다운로드)</button>
      </div>
      <div style={{marginTop:12}} className='mono'>{msg||'—'}</div>
    </div>
  </div>
}