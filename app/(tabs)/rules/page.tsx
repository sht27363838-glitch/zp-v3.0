'use client'

import React, { useEffect, useState } from 'react'
import { loadRules, saveRules, type Rules } from '../../_lib/rules'

type N = number
const n = (v: any) => Number.isFinite(Number(v)) ? Number(v) : 0

export default function RulesEditor(){
  const [rules, setRules] = useState<Rules>(loadRules())
  const [msg, setMsg] = useState('')

  // 저장
  function onSave(){
    // 간단 검증
    const b = rules.barbell
    if (b.stableMin + b.edgeMin > 1) return setMsg('❌ 최소 비중 합이 100%를 초과합니다.')
    if (b.stableMax + b.edgeMax < 1) return setMsg('❌ 최대 비중 합이 100% 미만입니다.')
    saveRules(rules)
    setMsg('✅ 저장 완료')
    setTimeout(()=>setMsg(''), 1500)
  }

  // 입력 핸들러 (상위 키)
  const set = (key: keyof Rules, val: any) => setRules(prev => ({...prev, [key]: val}))

  // 하위(중첩) 전용 헬퍼
  const setBarbell = (k: keyof Rules['barbell'], v: N) =>
    setRules(p => ({...p, barbell: {...p.barbell, [k]: v}}))

  const setTrig = (group: keyof Rules['triggers'], k: keyof Rules['triggers'][typeof group], v: N) =>
    setRules(p => ({...p, triggers: {...p.triggers, [group]: {...p.triggers[group], [k]: v}}}))

  const setDebuff = (group: keyof Rules['debuffs'], k: keyof Rules['debuffs'][typeof group], v: N) =>
    setRules(p => ({...p, debuffs: {...p.debuffs, [group]: {...p.debuffs[group], [k]: v}}}))

  // UI
  return (
    <div className="page">
      <h1>Rules Editor</h1>
      {msg && <div className="banner success">{msg}</div>}

      <section className="card">
        <h2>Cap & Barbell</h2>
        <div className="grid">
          <label className="row">Cap Ratio
            <input type="number" step="0.01"
              value={rules.capRatio}
              onChange={e=>set('capRatio', n(e.target.value))}/>
          </label>

          <label className="row">Stable Min
            <input type="number" step="0.01"
              value={rules.barbell.stableMin}
              onChange={e=>setBarbell('stableMin', n(e.target.value))}/>
          </label>

          <label className="row">Stable Max
            <input type="number" step="0.01"
              value={rules.barbell.stableMax}
              onChange={e=>setBarbell('stableMax', n(e.target.value))}/>
          </label>

          <label className="row">Edge Min
            <input type="number" step="0.01"
              value={rules.barbell.edgeMin}
              onChange={e=>setBarbell('edgeMin', n(e.target.value))}/>
          </label>

          <label className="row">Edge Max
            <input type="number" step="0.01"
              value={rules.barbell.edgeMax}
              onChange={e=>setBarbell('edgeMax', n(e.target.value))}/>
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Triggers</h2>
        <h3>Daily Loop</h3>
        <div className="grid">
          <label className="row">Stable % (of last month profit)
            <input type="number" step="0.1"
              value={rules.triggers.dailyLoop.stablePct}
              onChange={e=>setTrig('dailyLoop','stablePct', n(e.target.value))}/>
          </label>
          <label className="row">Edge % (of last month profit)
            <input type="number" step="0.1"
              value={rules.triggers.dailyLoop.edgePct}
              onChange={e=>setTrig('dailyLoop','edgePct', n(e.target.value))}/>
          </label>
          <label className="row">Cooldown (hours)
            <input type="number" step="1"
              value={rules.triggers.dailyLoop.cooldownH}
              onChange={e=>setTrig('dailyLoop','cooldownH', n(e.target.value))}/>
          </label>
        </div>

        <h3>Weekly Boss</h3>
        <div className="grid">
          <label className="row">Stable %
            <input type="number" step="0.1"
              value={rules.triggers.weeklyBoss.stablePct}
              onChange={e=>setTrig('weeklyBoss','stablePct', n(e.target.value))}/>
          </label>
          <label className="row">Edge %
            <input type="number" step="0.1"
              value={rules.triggers.weeklyBoss.edgePct}
              onChange={e=>setTrig('weeklyBoss','edgePct', n(e.target.value))}/>
          </label>
          <label className="row">Cooldown (days)
            <input type="number" step="1"
              value={rules.triggers.weeklyBoss.cooldownD}
              onChange={e=>setTrig('weeklyBoss','cooldownD', n(e.target.value))}/>
          </label>
        </div>

        <h3>Monthly Boss</h3>
        <div className="grid">
          <label className="row">Stable %
            <input type="number" step="0.1"
              value={rules.triggers.monthlyBoss.stablePct}
              onChange={e=>setTrig('monthlyBoss','stablePct', n(e.target.value))}/>
          </label>
          <label className="row">Edge %
            <input type="number" step="0.1"
              value={rules.triggers.monthlyBoss.edgePct}
              onChange={e=>setTrig('monthlyBoss','edgePct', n(e.target.value))}/>
          </label>
          <label className="row">Cooldown (days)
            <input type="number" step="1"
              value={rules.triggers.monthlyBoss.cooldownD}
              onChange={e=>setTrig('monthlyBoss','cooldownD', n(e.target.value))}/>
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Debuffs</h2>
        <div className="grid">
          <label className="row">Ad Fatigue · CTR &lt;
            <input type="number" step="0.001"
              value={rules.debuffs.adFatigue.ctrLt}
              onChange={e=>setDebuff('adFatigue','ctrLt', n(e.target.value))}/>
          </label>
          <label className="row">Returns Spike · Rate &gt;
            <input type="number" step="0.001"
              value={rules.debuffs.returnsSpike.rateGt}
              onChange={e=>setDebuff('returnsSpike','rateGt', n(e.target.value))}/>
          </label>
          <label className="row">Payout Cut (0~1)
            <input type="number" step="0.1"
              value={rules.debuffs.returnsSpike.payoutCut}
              onChange={e=>setDebuff('returnsSpike','payoutCut', n(e.target.value))}/>
          </label>
        </div>
      </section>

      <div className="actions">
        <button className="btn primary" onClick={onSave}>저장</button>
      </div>
    </div>
  )
}
  
