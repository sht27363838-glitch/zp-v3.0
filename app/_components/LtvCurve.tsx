'use client'
export default function LtvCurve({cum}:{cum:number[]}){
  if(!cum?.length) return <div className="muted">데이터 없음</div>
  const max = Math.max(...cum, 1)
  const pts = cum.map((v,i)=>`${(i/(cum.length-1))*100},${100-(v/max)*100}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" width="100%" height="80" preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="2.2" points={pts}/>
    </svg>
  )
}

