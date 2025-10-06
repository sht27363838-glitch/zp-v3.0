// app/_lib/rules.ts
export type Rules = {
  capRatio: number
  triggers: {
    dailyLoop: { stablePct: number; edgePct: number; cooldownH: number }
    weeklyBoss: { stablePct: number; edgePct: number; cooldownD: number }
    monthlyBoss: { stablePct: number; edgePct: number; cooldownD: number }
  }
  debuffs: {
    adFatigue: { ctrLt: number }                // CTR이 이 값보다 낮으면 경고
    returnsSpike: { rateGt: number; payoutCut: number } // 반품률 초과 시 보상 감액
  }
}

const DEFAULT_RULES: Rules = {
  capRatio: 0.10,
  triggers: {
    dailyLoop:  { stablePct: 0.2, edgePct: 0.0, cooldownH: 24 },
    weeklyBoss: { stablePct: 2.0, edgePct: 0.5, cooldownD: 7  },
    monthlyBoss:{ stablePct: 5.0, edgePct: 1.0, cooldownD: 30 },
  },
  debuffs: {
    adFatigue:   { ctrLt: 0.006 },    // 0.6%
    returnsSpike:{ rateGt: 0.03, payoutCut: 0.5 },
  }
}

export function loadRules(): Rules {
  try {
    const raw = localStorage.getItem('rewards_rules.json')
    if (!raw) return DEFAULT_RULES
    const obj = JSON.parse(raw)
    return { ...DEFAULT_RULES, ...obj }
  } catch {
    return DEFAULT_RULES
  }
}

// 평가에 필요한 최소 메트릭
export type GuardInput = {
  revenue: number
  ad_cost: number
  orders: number
  visits: number
  returns: number
  ctr: number          // clicks/visits 로 근사
  freq?: number        // (없으면 무시)
}

export function evalGuards(m: GuardInput, rules: Rules){
  const returnsRate = m.orders ? (m.returns || 0)/m.orders : 0
  const adFatigue = (m.ctr || 0) < rules.debuffs.adFatigue.ctrLt
  const returnsHigh = returnsRate > rules.debuffs.returnsSpike.rateGt
  return { returnsRate, adFatigue, returnsHigh }
}
