'use client'
import React from 'react'

export default function ThemeToggle(){
  const [light,setLight] = React.useState(false)
  React.useEffect(()=>{
    const saved = localStorage.getItem('theme') === 'light'
    setLight(saved)
    document.documentElement.classList.toggle('light', saved)
  },[])
  const flip = ()=>{
    const next = !light
    setLight(next)
    document.documentElement.classList.toggle('light', next)
    localStorage.setItem('theme', next ? 'light' : 'dark')
  }
  return <button className="badge" onClick={flip}>{light? '라이트' : '다크'}</button>
}
