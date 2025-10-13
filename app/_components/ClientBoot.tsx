'use client'
import { useEffect } from 'react'
import { checkContrastOnce } from '../_lib/a11y'

export default function ClientBoot(){
  useEffect(()=>{ checkContrastOnce() },[])
  return null
}
