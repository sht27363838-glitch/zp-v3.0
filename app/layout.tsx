import type { Metadata } from 'next'
import './globals.css'
import Nav from './_components/Nav'

export const metadata: Metadata = {
  title: 'ZP Command — v3.0',
  description: 'QuestForge D2C Control Tower (Next.js + Supabase)',
}

export default function RootLayout({children}:{children:React.ReactNode}){
  return (
    <html lang='ko'>
      <body>
        <Nav/>
        <div className='container'>{children}</div>
      </body>
    </html>
  )
}
