'use client'
export default function Error({error}:{error:Error}){
  return <div className='card'>오류: {error.message}</div>
}
