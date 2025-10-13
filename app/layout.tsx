import './_styles/base.css'
import './globals.css'
import Nav from './_components/Nav'
import ClientBoot from './_components/ClientBoot'
import React from 'react'

export const metadata = {
  title: 'ZP Command v3',
  description: 'QuestForge control tower',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 레이아웃은 서버 컴포넌트(기본). useEffect는 ClientBoot에서 처리.
  return (
    <html lang="ko">
      <body>
        <ClientBoot />
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
