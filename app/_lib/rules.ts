// app/_lib/rules.ts
// 클라이언트 전용 저장(localStorage) 접근이 포함되므로,
// 'use client' 컴포넌트에서 임포트해 사용하십시오.

export type Rules = {
  capRatio: number
  // 바벨 밴드(목표/가드레일) — UI 에디터에서 편집
  barbell: {
    stableMin: number; // 0.70
    stableMax: number; // 0.85
    edgeMin:   number; // 0.15
    edgeMax:   number; // 0.30
  }
  triggers: {
    dailyLoop:  { stablePct: number; edgePct: number; cooldownH: number }
    weeklyBoss: { stablePct: number; edgePct: number; cooldownD: number }
    monthlyBoss:{ stablePct: number; edgePct: number; cooldownD: number }
  }
  debuffs: {
    adFatigue:    { ctrLt: number }                      // CTR 임계(예: 0.006=0.6%)
    returnsSpike: { rateGt: number; payoutCut: number }  // 반품률 초과 시 감액 비율
  }
}

export const DEFAULT_RULES: Rules = {
  capRatio: 0.10,
  barbell: { stableMin: 0.70, stableMax: 0.85, edgeMin: 0.15, edgeMax: 0.30 },
  triggers: {
    dailyLoop:  { stablePct: 0.2, edgePct: 0.0, cooldownH: 24 },
    weeklyBoss: { stablePct: 2.0, edgePct: 0.5, cooldownD: 7  },
    monthlyBoss:{ stablePct: 5.0, edgePct: 1.0, cooldownD: 30 },
  },
  debuffs: {
    adFatigue:    { ctrLt: 0.006 },
    returnsSpike: { rateGt: 0.03, payoutCut: 0.5 },
  }
}

const STORAGE_KEY = 'rewards_rules.json'

// 숫자 정규화
function nn(v: any, fallback: number){ 
  const n = Number(v)
  return isFinite(n) ? n : fallback
}

// 기본값과 병합(깊은 병합)
export function mergeWithDefaults(partial: Partial<Rules>): Rules {
  const d = DEFAULT_RULES
  const p = partial || {}
  return {
    capRatio: nn((p as any).capRatio, d.capRatio),
    barbell: {
      stableMin: nn((p as any)?.barbell?.stableMin, d.barbell.stableMin),
      stableMax: nn((p as any)?.barbell?.stableMax, d.barbell.stableMax),
      edgeMin:   nn((p as any)?.barbell?.edgeMin,   d.barbell.edgeMin),
      edgeMax:   nn((p as any)?.barbell?.edgeMax,   d.barbell.edgeMax),
    },
    triggers: {
      dailyLoop: {
        stablePct: nn((p as any)?.triggers?.dailyLoop?.stablePct, d.triggers.dailyLoop.stablePct),
        edgePct:   nn((p as any)?.triggers?.dailyLoop?.edgePct,   d.triggers.dailyLoop.edgePct),
        cooldownH: nn((p as any)?.triggers?.dailyLoop?.cooldownH, d.triggers.dailyLoop.cooldownH),
      },
      weeklyBoss: {
        stablePct: nn((p as any)?.triggers?.weeklyBoss?.stablePct, d.triggers.weeklyBoss.stablePct),
        edgePct:   nn((p as any)?.triggers?.weeklyBoss?.edgePct,   d.triggers.weeklyBoss.edgePct),
        cooldownD: nn((p as any)?.triggers?.weeklyBoss?.cooldownD, d.triggers.weeklyBoss.cooldownD),
      },
      monthlyBoss: {
        stablePct: nn((p as any)?.triggers?.monthlyBoss?.stablePct, d.triggers.monthlyBoss.stablePct),
        edgePct:   nn((p as any)?.triggers?.monthlyBoss?.edgePct,   d.triggers.monthlyBoss.edgePct),
        cooldownD: nn((p as any)?.triggers?.monthlyBoss?.cooldownD, d.triggers.monthlyBoss.cooldownD),
      },
    },
    debuffs: {
      adFatigue: {
        ctrLt: nn((p as any)?.debuffs?.adFatigue?.ctrLt, d.debuffs.adFatigue.ctrLt),
      },
      returnsSpike: {
        rateGt:    nn((p as any)?.debuffs?.returnsSpike?.rateGt,    d.debuffs.returnsSpike.rateGt),
        payoutCut: nn((p as any)?.debuffs?.returnsSpike?.payoutCut, d.debuffs.returnsSpike.payoutCut),
      }
    }
  }
}

// 로드
export function loadRules(): Rules {
  try {
    if (typeof window === 'undefined') return DEFAULT_RULES
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_RULES
    const parsed = JSON.parse(raw)
    return mergeWithDefaults(parsed)
  } catch {
    return DEFAULT_RULES
  }
}

// 저장(룰 에디터에서 사용)
export function saveRules(next: Partial<Rules> | Rules){
  if (typeof window === 'undefined') return
  const merged = mergeWithDefaults(next as any)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
}

// 가드 평가(배지/잠금/감액 판단)
export type GuardInput = {
  revenue: number
  ad_cost: number
  orders: number
  visits: number
  returns: number
  ctr: number
  freq?: number
}

export function evalGuards(m: GuardInput, rules: Rules){
  const returnsRate = m.orders ? (m.returns || 0)/m.orders : 0
  const adFatigue   = (m.ctr || 0) < rules.debuffs.adFatigue.ctrLt
  const returnsHigh = returnsRate > rules.debuffs.returnsSpike.rateGt
  return { returnsRate, adFatigue, returnsHigh }
}

