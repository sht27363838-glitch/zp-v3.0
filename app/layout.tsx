import './globals.css';
import Nav from './_components/Nav';

export const metadata = { title:'ZP Command v3.1', description:'Tactical Calm HUD' };

export default function RootLayout({ children }:{children:React.ReactNode}){
  return (
    <html lang="ko"><body>
      <Nav/>
      <div className="container">{children}</div>
    </body></html>
  );
}
