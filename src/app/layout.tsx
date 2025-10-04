export const metadata = { title: 'ZP Command', description: 'QuestForge HUD' }
import './globals.css'
import Nav from './_components/Nav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Nav/>
        {children}
      </body>
    </html>
  )
}