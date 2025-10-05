// app/page.tsx
'use client';

import Link from 'next/link';

export default function C0Home() {
  return (
    <main style={{padding:'24px'}}>
      <h1 style={{marginBottom:16}}>C0 지휘소</h1>

      {/* 상태 → 판단 → 지시 : 비어있을 땐 안내만 */}
      <section style={{background:'#151a1e', borderRadius:12, padding:16, marginBottom:16}}>
        <h3 style={{margin:'0 0 8px'}}>상태 → 판단 → 지시</h3>
        <p style={{opacity:.8, margin:0}}>
          업로드된 데이터가 있으면 지표 요약이 여기 뜹니다. 지금은
          <b> 도구 탭에서 CSV 업로드</b> 후 리포트를 확인하세요.
        </p>
      </section>

      {/* 빠른 이동 */}
      <div style={{display:'flex', gap:12}}>
        <Link href="/report" className="btn">리포트 열기</Link>
        <Link href="/data" className="btn">데이터 관리</Link>
        <Link href="/tools" className="btn">도구(업로드)</Link>
      </div>

      <style jsx global>{`
        .btn {
          padding:10px 14px; border-radius:10px; border:1px solid #0ea5e955;
          background:#0ea5e91a; color:#e6eaf0; text-decoration:none;
        }
        .btn:hover { border-color:#0ea5e9aa; background:#0ea5e933; }
      `}</style>
    </main>
  );
}
