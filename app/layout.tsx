// /app/layout.tsx  (server component)
import './_styles/contrast.css'
import './_styles/tokens.css'
import './_styles/base.css'
import './globals.css';
import Nav from './_components/Nav';
import { useEffect } from 'react'
import { checkContrastOnce } from './_lib/a11y'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(()=>{ checkContrastOnce() },[])
  return <html lang="ko"><body>{children}</body></html>
}
export const metadata = {
  title: 'ZP Command v3',
  description: 'QuestForge control tower',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
