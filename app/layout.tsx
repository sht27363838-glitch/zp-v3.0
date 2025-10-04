import type { Metadata } from 'next'
import './globals.css'
import Nav from './_components/Nav'
import dynamic from 'next/dynamic'
const ToastHost = dynamic(()=>import('./_components/ToastHost'),{ssr:false})

export const metadata: Metadata = {
  title: 'ZP Command — v3.0',
  description: '게임형 D2C 지휘앱 (QuestForge)',
  openGraph: { title: 'ZP Command — v3.0', description: '게임형 D2C 지휘앱 (QuestForge)', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'ZP Command — v3.0', description: '게임형 D2C 지휘앱 (QuestForge)' }
}
export default function RootLayout({children}:{children:React.ReactNode}){
  return (<html lang='ko'><body><Nav/><div className='container'>{children}</div><ToastHost/></body></html>)
}