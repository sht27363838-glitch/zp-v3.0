'use client'
export type Rules = {
  cap_ratio: number,
  barbell: { stableMin:number, stableMax:number, edgeMin:number, edgeMax:number },
  lockups: { stableDays:number, edgeDays:number },
  debuffs: {
    adFatigue: { freq:number, ctrLt:number, edgeLock:boolean, stableFloorPct:number },
    returnsSpike: { rateGt:number, payoutCut:number }
  },
  triggers: {
    dailyLoop: { stablePct:number, edgePct:number, cooldownH:number },
    weeklyBoss: { stablePct:number, edgePct:number, cooldownD:number },
    monthlyBoss: { stablePct:number, edgePct:number, cooldownD:number }
  }
}

const DEFAULT: Rules = {
  cap_ratio: 0.10,
  barbell: { stableMin:.70, stableMax:.85, edgeMin:.15, edgeMax:.30 },
  lockups: { stableDays:7, edgeDays:30 },
  debuffs: {
    adFatigue: { freq:3.0, ctrLt:0.006, edgeLock:true, stableFloorPct:0.2 },
    returnsSpike: { rateGt:0.03, payoutCut:0.5 }
  },
  triggers: {
    dailyLoop: { stablePct:0.2, edgePct:0.0, cooldownH:24 },
    weeklyBoss: { stablePct:2.0, edgePct:0.5, cooldownD:7 },
    monthlyBoss:{ stablePct:5.0, edgePct:1.0, cooldownD:30 }
  }
}

export function loadRules(): Rules {
  try { const s = localStorage.getItem('rules'); return s? JSON.parse(s): DEFAULT } catch { return DEFAULT }
}
export function saveRules(r: Rules) { localStorage.setItem('rules', JSON.stringify(r)) }

export type KpiTotal = { revenue:number, ad_cost:number, orders:number, visits:number, returns:number, freq?:number, ctr?:number }
export type Guards = { adFatigue:boolean, returnsHigh:boolean, edgeLock:boolean, payoutCut:number }

export function evalGuards(k: KpiTotal, rules: Rules): Guards {
  const adFatigue = (k.freq??0) >= rules.debuffs.adFatigue.freq && (k.ctr??0) < rules.debuffs.adFatigue.ctrLt
  const returnsHigh = (k.returns||0) / Math.max(1,(k.orders||0)) > rules.debuffs.returnsSpike.rateGt
  const edgeLock = adFatigue && rules.debuffs.adFatigue.edgeLock
  const payoutCut = returnsHigh ? rules.debuffs.returnsSpike.payoutCut : 1
  return { adFatigue, returnsHigh, edgeLock, payoutCut }
}

export function computeCapUsed(lastMonthProfit:number, ledgerSum:number, rules:Rules){
  const cap = (lastMonthProfit||0) * rules.cap_ratio
  return { cap, used: ledgerSum, ratio: cap? ledgerSum/cap : 0 }
}
