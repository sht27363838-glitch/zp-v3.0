'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  ['/',        '지휘소'],
  ['/growth',  '유입'],
  ['/commerce','전환'],
  ['/rewards', '보상'],
  ['/ops',     '운영'],
  ['/experiments','실험'],
  ['/decisions','결정큐'],
  ['/data',    '데이터'],
  ['/report',  '리포트'],
  ['/tools',   '도구'],
] as const;

export default function Nav(){
  const p = usePathname() || '/';
  return (
    <div className="nav">
      {tabs.map(([href,label])=>(
        <Link key={href} href={href as any} className={'tab '+(p===href?'active':'')}>{label}</Link>
      ))}
    </div>
  );
}

