'use client'
import React from 'react'

export default function ScrollWrap({children}:{children:React.ReactNode}){
  return (
    <div style={{overflow:'auto', maxHeight:'70vh', borderRadius:12}}>
      {children}
    </div>
  )
}
