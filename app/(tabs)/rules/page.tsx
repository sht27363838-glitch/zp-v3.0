'use client'

import React, { useState } from 'react'
import { loadRules, saveRules, type Rules } from '../../_lib/rules'

const n = (v: any) => Number.isFinite(Number(v)) ? Number(v) : 0

export default function RulesEditor(){
  const [rules, setRules] = useState<Rules>(loadRules())
  const [msg, setMsg] = useState('')

  // 저장 + 간단 검증
  function onSave(){
    const b = rules.barbell
    if ((b.stableMin ?? 0) + (b.edgeMin ?? 0) > 1) {
      setMsg('❌ 최소 비중 합이 100%를 초과합니다.'); return
    }
    if ((b.stableMax ?? 0) + (b.edgeMax ?? 0) < 1) {
      setMsg('❌ 최대 비중 합이 100% 미만입니다.'); return
    }
    saveRules(rules)
    setMsg('✅ 저장 완료'); setTimeout(()=>setMsg(''), 1500)
  }

  // 상위 키 교체
  const setTop = (key: keyof Rules, val: any) =>
    setRules(prev => ({ ...prev, [key]: val }))

  // 중첩 업데이트(바벨)
  const setBarbell = (k: keyof Rules['barbell'], v: number) =>
    setRules(p => ({ ...p, barbell: { ...p.barbell, [k]: v } }))

  // 트리거 업데이트(안전형: 키를 느슨하게 받아 타입 에러 방지)
  const setTrigAny = (group: 'dailyLoop'|'weeklyBoss'|'monthlyBoss', k: string, v: number) =>
    setRules(p => ({
      ...p,
      triggers: {
        ...p.triggers,
        [group]: {
          ...(p.triggers as any)[group],
          [k]: v
        }
      }
    }))

  // 디버프 업데이트(안전형)
  const setDebuffAny = (group: 'adFatigue'|'returnsSpike', k: string, v: number|boolean) =>
    setRules(p => ({
      ...p,
      debuffs: {
        ...p.debuffs,
        [group]: {
          ...(p.debuffs as any)[group],
          [k]: v
        }
      }
    }))

  return (
    <div className="page">
      <h1>Rules Editor</h1>
      {msg && <div className="banner success">{msg}</div>}

      {/* Cap & Barbell */}
      <section className="card">
        <h2>Cap & Barbell</h2>
        <div className="grid">
          <label className="row">Cap Ratio
            <input type="number" step="0.01"
              value={(rules as any).capRatio ?? 0}
              onChange={e=>setTop('capRatio' as any, n(e.target.value))}/>
          </label>

          <label className="row">Stable Min
            <input type="number" step="0.01"
              value={rules.barbell.stableMin ?? 0}
              onChange={e=>setBarbell('stableMin', n(e.target.value))}/>
          </label>
          <label className="row">Stable Max
            <input type="number" step="0.01"
              value={rules.barbell.stableMax ?? 0}
              onChange={e=>setBarbell('stableMax', n(e.target.value))}/>
          </label>
          <label className="row">Edge Min
            <input type="number" step="0.01"
              value={rules.barbell.edgeMin ?? 0}
              onChange={e=>setBarbell('edgeMin', n(e.target.value))}/>
          </label>
          <label className="row">Edge Max
            <input type="number" step="0.01"
              value={rules.barbell.edgeMax ?? 0}
              onChange={e=>setBarbell('edgeMax', n(e.target.value))}/>
          </label>
        </div>
      </section>

      {/* Triggers */}
      <section className="card">
        <h2>Triggers</h2>

        <h3>Daily Loop</h3>
        <div className="grid">
          <label className="row">Stable % (of last month profit)
            <input type="number" step="0.1"
              value={(rules.triggers.dailyLoop as any).stablePct ?? 0}
              onChange={e=>setTrigAny('dailyLoop','stablePct', n(e.target.value))}/>
          </label>
          <label className="row">Edge % (of last month profit)
            <input type="number" step="0.1"
              value={(rules.triggers.dailyLoop as any).edgePct ?? 0}
              onChange={e=>setTrigAny('dailyLoop','edgePct', n(e.target.value))}/>
          </label>
          <label className="row">Cooldown (hours)
            <input type="number" step="1"
              value={(rules.triggers.dailyLoop as any).cooldownH ?? 24}
              onChange={e=>setTrigAny('dailyLoop','cooldownH', n(e.target.value))}/>
          </label>
        </div>

        <h3>Weekly Boss</h3>
        <div className="grid">
          <label className="row">Stable %
            <input type="number" step="0.1"
              value={(rules.triggers.weeklyBoss as any).stablePct ?? 0}
              onChange={e=>setTrigAny('weeklyBoss','stablePct', n(e.target.value))}/>
          </label>
          <label className="row">Edge %
            <input type="number" step="0.1"
              value={(rules.triggers.weeklyBoss as any).edgePct ?? 0}
              onChange={e=>setTrigAny('weeklyBoss','edgePct', n(e.target.value))}/>
          </label>
          <label className="row">Cooldown (days)
            <input type="number" step="1"
              value={(rules.triggers.weeklyBoss as any).cooldownD ?? 7}
              onChange={e=>setTrigAny('weeklyBoss','cooldownD', n(e.target.value))}/>
          </label>
        </div>

        <h3>Monthly Boss</h3>
        <div className="grid">
          <label className="row">Stable %
            <input type="number" step="0.1"
              value={(rules.triggers.monthlyBoss as any).stablePct ?? 0}
              onChange={e=>setTrigAny('monthlyBoss','stablePct', n(e.target.value))}/>
          </label>
          <label className="row">Edge %
            <input type="number" step="0.1"
              value={(rules.triggers.monthlyBoss as any).edgePct ?? 0}
              onChange={e=>setTrigAny('monthlyBoss','edgePct', n(e.target.value))}/>
          </label>
          <label className="row">Cooldown (days)
            <input type="number" step="1"
              value={(rules.triggers.monthlyBoss as any).cooldownD ?? 30}
              onChange={e=>setTrigAny('monthlyBoss','cooldownD', n(e.target.value))}/>
          </label>
        </div>
      </section>

      {/* Debuffs */}
      <section className="card">
        <h2>Debuffs</h2>
        <div className="grid">
          <label className="row">Ad Fatigue · CTR &lt;
            <input type="number" step="0.001"
              value={(rules.debuffs.adFatigue as any).ctrLt ?? 0.006}
              onChange={e=>setDebuffAny('adFatigue','ctrLt', n(e.target.value))}/>
          </label>
          <label className="row">Returns Spike · Rate &gt;
            <input type="number" step="0.001"
              value={(rules.debuffs.returnsSpike as any).rateGt ?? 0.03}
              onChange={e=>setDebuffAny('returnsSpike','rateGt', n(e.target.value))}/>
          </label>
          <label className="row">Payout Cut (0~1)
            <input type="number" step="0.1"
              value={(rules.debuffs.returnsSpike as any).payoutCut ?? 0.5}
              onChange={e=>setDebuffAny('returnsSpike','payoutCut', n(e.target.value))}/>
          </label>
        </div>
      </section>

      <div className="actions">
        <button className="btn primary" onClick={onSave}>저장</button>
      </div>
    </div>
  )
}
