import './globals.css'
import './ui-patch.css'
import dynamic from 'next/dynamic'

const ClientNav = dynamic(() => import('./_components/ClientNav'), { ssr: false })

export const metadata = {
  title: 'ZP Command — QuestForge',
  description: '게임형 D2C 지휘·보상 OS',
  themeColor: '#0F1216',
  openGraph: {
    title: 'ZP Command — QuestForge',
    description: '실험→운영→현금흐름→바벨 보상',
    type: 'website',
    url: 'https://YOUR_DOMAIN',
    images: ['/og.png'],
  },
  icons: { icon: '/icon-192.png', apple: '/apple-touch-icon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko'>
      <body>
        <header style={{padding:'12px 16px', borderBottom:'1px solid #232A31'}}>
          <a
            href='#main'
            className='sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black px-3 py-2 rounded'
          >
            본문 바로가기
          </a>
          <ClientNav />
        </header>
        <main id='main' style={{padding:'16px'}}>{children}</main>
      </body>
    </html>
  )
}
