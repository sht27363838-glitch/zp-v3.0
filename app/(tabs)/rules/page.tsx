'use client'
import React, {useState, useEffect} from 'react'
import {loadRules, saveRules, type Rules} from '../../_lib/rules'

export default function RulesEditor(){
  const [rules, setRules] = useState<Rules>(loadRules())
  const [msg, setMsg] = useState<string>('')

  useEffect(()=>{ setRules(loadRules()) },[])

  function update<K extends keyof Rules>(k:K, v:any){
    setRules({...rules, [k]: v})
  }
  function save(){
    // 간단 검증
    const {barbell} = rules
    if(barbell.stableMin + barbell.edgeMin > 1) return setMsg('❌ 최소 비중 합이 100%를 넘습니다.')
    if(barbell.stableMax + barbell.edgeMax < 1) return setMsg('❌ 최대 비중 합이 100% 미만입니다.')
    saveRules(rules); setMsg('✅ 저장 완료')
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Rules Editor</h2>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">Cap</h3>
          <label className="row">Cap Ratio
            <input type="number" step="0.01" value={rules.cap_ratio}
              onChange={e=>update('cap_ratio', Number(e.target.value))}/>
          </label>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Barbell Bands</h3>
          <div className="grid grid-cols-2 gap-2">
            <label className="row">Stable Min<input type="number" step="0.01"
              value={rules.barbell.stableMin}
              onChange={e=>update('barbell', {...rules.barbell, stableMin:Number(e.target.value)})}/></label>
            <label className="row">Stable Max<input type="number" step="0.01"
              value={rules.barbell.stableMax}
              onChange={e=>update('barbell', {...rules.barbell, stableMax:Number(e.target.value)})}/></label>
            <label className="row">Edge Min<input type="number" step="0.01"
              value={rules.barbell.edgeMin}
              onChange={e=>update('barbell', {...rules.barbell, edgeMin:Number(e.target.value)})}/></label>
            <label className="row">Edge Max<input type="number" step="0.01"
              value={rules.barbell.edgeMax}
              onChange={e=>update('barbell', {...rules.barbell, edgeMax:Number(e.target.value)})}/></label>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Lockups</h3>
          <label className="row">Stable Days
            <input type="number" value={rules.lockups.stableDays}
              onChange={e=>update('lockups', {...rules.lockups, stableDays:Number(e.target.value)})}/>
          </label>
          <label className="row">Edge Days
            <input type="number" value={rules.lockups.edgeDays}
              onChange={e=>update('lockups', {...rules.lockups, edgeDays:Number(e.target.value)})}/>
          </label>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Debuffs</h3>
          <label className="row">Ad Freq≥
            <input type="number" step="0.1"
              value={rules.debuffs.adFatigue.freq}
              onChange={e=>update('debuffs', {...rules.debuffs, adFatigue:{...rules.debuffs.adFatigue, freq:Number(e.target.value)}})}/>
          </label>
          <label className="row">CTR &lt;
            <input type="number" step="0.001"
              value={rules.debuffs.adFatigue.ctrLt}
              onChange={e=>update('debuffs', {...rules.debuffs, adFatigue:{...rules.debuffs.adFatigue, ctrLt:Number(e.target.value)}})}/>
          </label>
          <label className="row">Returns &gt;
            <input type="number" step="0.01"
              value={rules.debuffs.returnsSpike.rateGt}
              onChange={e=>update('debuffs', {...rules.debuffs, returnsSpike:{...rules.debuffs.returnsSpike, rateGt:Number(e.target.value)}})}/>
          </label>
          <label className="row">Payout Cut(0~1)
            <input type="number" step="0.1"
              value={rules.debuffs.returnsSpike.payoutCut}
              onChange={e=>update('debuffs', {...rules.debuffs, returnsSpike:{...rules.debuffs.returnsSpike, payoutCut:Number(e.target.value)}})}/>
          </label>
        </div>
      </section>

      <div className="flex gap-3">
        <button className="btn primary" onClick={save}>저장</button>
        {msg && <span className="badge info">{msg}</span>}
      </div>
    </div>
  )
}
