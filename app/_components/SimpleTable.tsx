export default function SimpleTable({rows}:{rows:any[]}){
  if(!rows || rows.length===0) return <div className='hint'>데이터 없음</div>
  const cols = Object.keys(rows[0])
  return <div className='card'>
    <table>
      <thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.map((r,i)=><tr key={i}>{cols.map(c=><td key={c}>{r[c]}</td>)}</tr>)}
      </tbody>
    </table>
  </div>
}
