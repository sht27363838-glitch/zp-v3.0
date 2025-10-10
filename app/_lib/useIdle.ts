'use client'
import { useEffect, useState } from 'react'

export default function useIdle(delay = 400) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let t = setTimeout(() => {
      // 브라우저가 한숨 돌린 뒤 작업
      if ('requestIdleCallback' in window) {
        ;(window as any).requestIdleCallback(() => setReady(true))
      } else {
        setReady(true)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [delay])
  return ready
}
