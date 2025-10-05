import Link from 'next/link';
export default function Home(){
  return (
    <div className='stack'>
      <section className='card'>
        <h2>C0 지휘소</h2>
        <p className='muted'>도구 탭에서 CSV를 넣으시면 /report·/growth·/rewards에 즉시 반영됩니다.</p>
        <div className='row gap'>
          <Link className='btn primary' href='/report'>리포트 열기</Link>
          <Link className='btn' href='/tools'>도구</Link>
        </div>
      </section>
    </div>
  );
}
