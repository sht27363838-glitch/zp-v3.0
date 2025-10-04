'use client'
export default function Error({ error, reset }:{ error: Error, reset: ()=>void }){
  return (<div className="card"><b>오류가 발생했습니다</b><div className="hint mono" style={{whiteSpace:'pre-wrap'}}>{String(error?.message||'')}</div><div className="badges" style={{marginTop:8}}><button className="badge" onClick={()=>reset()}>다시 시도</button></div></div>)
}