import './globals.css'
import dynamic from 'next/dynamic'

// 서버 레이아웃 → 클라이언트 Nav를 동적 로드(ssr:false)하여 부모 체인 문제 제거
const ClientNav = dynamic(() => import('./_components/ClientNav'), { ssr: false })

export const metadata = {
  title: 'ZP Command v3',
  description: 'QuestForge control tower'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko'>
      <body>
        <header style={{padding:'12px 16px', borderBottom:'1px solid #232A31'}}>
          <ClientNav />
        </header>
        <main style={{padding:'16px'}}>{children}</main>
      </body>
    </html>
  )
}
