// app/_components/ThemeToggle.tsx
'use client'
import React from 'react'

const KEY = 'theme' // 'light' | 'dark'

export default function ThemeToggle(){
  const [mode, setMode] = React.useState<'light'|'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem(KEY) as any) || 'light'
  })

  React.useEffect(() => {
    const html = document.documentElement
    if (mode === 'light') {
      html.classList.add('light')
    } else {
      html.classList.remove('light')
    }
    localStorage.setItem(KEY, mode)
  }, [mode])

  return (
    <button className="btn" onClick={()=>setMode(m => m==='light' ? 'dark' : 'light')}>
      테마: {mode === 'light' ? '라이트' : '다크'}
    </button>
  )
}
