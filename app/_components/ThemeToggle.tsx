'use client'
import React, { useEffect, useState } from 'react'

const THEME_KEY = 'theme' // 'dark' | 'light'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark'|'light'>('dark')

  // 첫 렌더 이전에 적용되도록(FOUC 최소화)
  useEffect(() => {
    const saved = (localStorage.getItem(THEME_KEY) as 'dark'|'light') || 'dark'
    setTheme(saved)
    document.documentElement.classList.toggle('light', saved === 'light')
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem(THEME_KEY, next)
    document.documentElement.classList.toggle('light', next === 'light')
  }

  return (
    <button className="btn" onClick={toggle} aria-label="테마 토글">
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
