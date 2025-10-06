// app/_lib/rules.ts
'use client'

export type Rules = {
  capRatio: number
  barbell: { stableMin: number; stableMax: number; edgeMin: number; edgeMax: number }
  debuffs: {
    returnsSpike: { rateGt: number; payoutCut: number }
    adFatigue: { freq: number; ctrLt: number }
  }
  triggers: {
    dailyLoop: { stablePct: number; edgePct: number; cooldownH: number }
    weeklyBoss?: { stablePct: number; edgePct: number; cooldownH: number }
    monthlyBoss?: { stablePct: number; edgePct: number; cooldownH: number }
  }
}

const DEFAULT_RULES: Rules = {
  capRatio: 0.10,
  barbell: { stableMin: 0.70, stableMax: 0.85, edgeMin: 0.15, edgeMax: 0.30 },
  debuffs: {
    returnsSpike: { rateGt: 0.03, payoutCut: 0.5 },
    adFatigue: { freq: 3.0, ctrLt: 0.006 },
  },
  triggers: {
    dailyLoop: { stablePct: 0.2, edgePct: 0.0, cooldownH: 24 },
    weeklyBoss: { stablePct: 2.0, edgePct: 0.5, cooldownH: 24 * 7 },
    monthlyBoss: { stablePct: 5.0, edgePct: 1.0, cooldownH: 24 * 30 },
  },
}

const KEY = 'rules.v3'

export function loadRules(): Rules {
  if (typeof window === 'undefined') return DEFAULT_RULES
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_RULES
    const parsed = JSON.parse(raw)
    // 얕은 머지로 필수 필드 보정
    return {
      ...DEFAULT_RULES,
      ...parsed,
      barbell: { ...DEFAULT_RULES.barbell, ...(parsed?.barbell || {}) },
      debuffs: {
        ...DEFAULT_RULES.debuffs,
        ...(parsed?.debuffs || {}),
        returnsSpike: { ...DEFAULT_RULES.debuffs.returnsSpike, ...(parsed?.debuffs?.returnsSpike || {}) },
        adFatigue: { ...DEFAULT_RULES.debuffs.adFatigue, ...(parsed?.debuffs?.adFatigue || {}) },
      },
      triggers: {
        ...DEFAULT_RULES.triggers,
        ...(parsed?.triggers || {}),
        dailyLoop: { ...DEFAULT_RULES.triggers.dailyLoop, ...(parsed?.triggers?.dailyLoop || {}) },
        weeklyBoss: { ...DEFAULT_RULES.triggers.weeklyBoss, ...(parsed?.triggers?.weeklyBoss || {}) },
        monthlyBoss: { ...DEFAULT_RULES.triggers.monthlyBoss, ...(parsed?.triggers?.monthlyBoss || {}) },
      },
    }
  } catch {
    return DEFAULT_RULES
  }
}

export function saveRules(rules: Rules) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(rules))
}

export type GuardCtx = {
  revenue: number
  ad_cost: number
  orders: number
  visits: number
  returns: number
  freq?: number
  ctr?: number
}

export function evalGuards(ctx: GuardCtx, rules: Rules) {
  const returnRate = ctx.orders ? ctx.returns / ctx.orders : 0
  const returnsHigh = returnRate > rules.debuffs.returnsSpike.rateGt
  const adFatigue = (ctx.freq || 0) >= rules.debuffs.adFatigue.freq && (ctx.ctr || 1) < rules.debuffs.adFatigue.ctrLt
  return { returnsHigh, adFatigue, returnRate }
}
