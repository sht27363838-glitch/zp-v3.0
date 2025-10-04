'use client'

import './globals.css'
import Nav from './_components/Nav'

export const metadata = {
  title: 'ZP Command v3',
  description: 'QuestForge control tower'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko'>
      <body>
        <header style={{padding:'12px 16px', borderBottom:'1px solid #232A31'}}>
          <Nav />
        </header>
        <main style={{padding:'16px'}}>{children}</main>
      </body>
    </html>
  )
}
