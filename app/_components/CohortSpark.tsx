'use client'
export default function CohortSpark({series}:{series:number[]}){
  if(!series?.length) return <div className="muted">데이터 없음</div>
  const max = Math.max(...series, 1)
  const pts = series.map((v,i)=>`${(i/(series.length-1))*100},${100-(v/max)*100}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" width="100%" height="64" preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={pts}/>
    </svg>
  )
}
