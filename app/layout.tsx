import './_styles/base.css'
import './_styles/v38.css'
import './globals.css'
import Nav from './_components/Nav'

export const metadata = {
  title: 'ZP Command v3',
  description: 'QuestForge control tower',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Nav />
        <main className="container">
          {/* 전역 에러 배너 슬롯(필요 시 window.__APP_ERROR로 표출 가능) */}
          <div id="__error-slot" />
          {children}
        </main>
      </body>
    </html>
  )
}
