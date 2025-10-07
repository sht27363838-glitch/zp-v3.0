// /app/layout.tsx  (server component)
import './_styles/tokens.css'
import './_styles/base.css'
import './globals.css';
import Nav from './_components/Nav';

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
