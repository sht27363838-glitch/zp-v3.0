// app/_lib/rules.ts
// v3.3 규칙/보상 스키마 표준안: weekly/monthly 트리거 포함 + 저장/로드 + 가드 평가

export type Rules = {
  // 바벨 밴드(안 쓰셔도 무방, 에디터에서 참조 가능)
  barbell?: {
    stableMin: number
    stableMax: number
    edgeMin: number
    edgeMax: number
  }
  // 캡 비율 (ex. 총 이익 대비 보상 한도)
  capRatio?: number

  // 트리거(일/주/월)
  triggers: {
    dailyLoop: { stablePct: number; edgePct: number; cooldownH: number }
    weeklyBoss: { stablePct: number; edgePct: number; cooldownH: number }
    monthlyBoss: { stablePct: number; edgePct: number; cooldownH: number }
  }

  // 디버프(감액/락업 등)
  debuffs: {
    returnsSpike: { payoutCut: number }     // 반품률 상승 시 감액 배수(0~1)
    adFatigue?: {                            // 광고 피로 규칙(선택)
      lockEdge: boolean                      // 엣지 보상 잠금
      ctrDrop?: number                       // CTR 하락 임계
      freqRise?: number                      // 노출 빈도 증가 임계
    }
  }
}

// 기본값(페이지에서 참조 시 안전)
const DEFAULT_RULES: Rules = {
  barbell: { stableMin: 0.3, stableMax: 0.7, edgeMin: 0.3, edgeMax: 0.7 },
  capRatio: 0.1,
  triggers: {
    dailyLoop:   { stablePct: 0.4, edgePct: 0.2, cooldownH: 20 },
    weeklyBoss:  { stablePct: 0.6, edgePct: 0.3, cooldownH: 144 },  // 6일
    monthlyBoss: { stablePct: 0.7, edgePct: 0.4, cooldownH: 24*20 }, // 20일
  },
  debuffs: {
    returnsSpike: { payoutCut: 0.5 },
    adFatigue: { lockEdge: true, ctrDrop: 0.3, freqRise: 1.5 },
  }
}

const LS_KEY = 'rules.v3'

// 저장
export function saveRules(rules: Rules) {
  if (typeof window === 'undefined') return
  try {
    const merged = normalizeRules(rules)
    localStorage.setItem(LS_KEY, JSON.stringify(merged))
  } catch (e) {
    console.error('saveRules failed:', e)
  }
}

// 로드 (+누락 필드 보정)
export function loadRules(): Rules {
  try {
    if (typeof window === 'undefined') return DEFAULT_RULES
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return DEFAULT_RULES
    const parsed = JSON.parse(raw)
    return normalizeRules(parsed)
  } catch {
    return DEFAULT_RULES
  }
}

// 누락된 섹션을 기본값으로 보정
function normalizeRules(r: Partial<Rules>): Rules {
  const base = structuredClone(DEFAULT_RULES)

  const out: Rules = {
    barbell: { ...(base.barbell!), ...(r.barbell||{}) },
    capRatio: coNum(r.capRatio, base.capRatio),
    triggers: {
      dailyLoop: {
        stablePct: coNum(r.triggers?.dailyLoop?.stablePct, base.triggers.dailyLoop.stablePct),
        edgePct:   coNum(r.triggers?.dailyLoop?.edgePct,   base.triggers.dailyLoop.edgePct),
        cooldownH: coNum(r.triggers?.dailyLoop?.cooldownH, base.triggers.dailyLoop.cooldownH),
      },
      weeklyBoss: {
        stablePct: coNum(r.triggers?.weeklyBoss?.stablePct, base.triggers.weeklyBoss.stablePct),
        edgePct:   coNum(r.triggers?.weeklyBoss?.edgePct,   base.triggers.weeklyBoss.edgePct),
        cooldownH: coNum(r.triggers?.weeklyBoss?.cooldownH, base.triggers.weeklyBoss.cooldownH),
      },
      monthlyBoss: {
        stablePct: coNum(r.triggers?.monthlyBoss?.stablePct, base.triggers.monthlyBoss.stablePct),
        edgePct:   coNum(r.triggers?.monthlyBoss?.edgePct,   base.triggers.monthlyBoss.edgePct),
        cooldownH: coNum(r.triggers?.monthlyBoss?.cooldownH, base.triggers.monthlyBoss.cooldownH),
      },
    },
    debuffs: {
      returnsSpike: {
        payoutCut: clamp01(coNum(r.debuffs?.returnsSpike?.payoutCut, base.debuffs.returnsSpike.payoutCut))
      },
      adFatigue: {
        lockEdge:  coBool(r.debuffs?.adFatigue?.lockEdge,  base.debuffs.adFatigue?.lockEdge ?? true),
        ctrDrop:   coNum(r.debuffs?.adFatigue?.ctrDrop,    base.debuffs.adFatigue?.ctrDrop ?? 0.3),
        freqRise:  coNum(r.debuffs?.adFatigue?.freqRise,   base.debuffs.adFatigue?.freqRise ?? 1.5),
      }
    }
  }
  return out
}

function coNum(v: any, d: number){ const n = Number(v); return Number.isFinite(n)? n : d }
function coBool(v: any, d: boolean){ return typeof v==='boolean'? v : d }
function clamp01(n: number){ return Math.max(0, Math.min(1, n)) }

// ─────────────────────────────────────────────────────────────
// 보조: 가드 평가 (HUD 배지/잠금 판단에 사용)
// 사용 예) const guards = evalGuards(kpi, rules)
export function evalGuards(
  kpi: { revenue:number; ad_cost:number; orders:number; visits:number; returns:number; freq?:number; ctr?:number },
  rules: Rules
){
  const ctr = Number(kpi.ctr ?? 0)
  const freq = Number(kpi.freq ?? 0)
  const adFatigue = !!rules.debuffs.adFatigue?.lockEdge &&
                    ( (rules.debuffs.adFatigue?.ctrDrop!==undefined && ctr <= rules.debuffs.adFatigue!.ctrDrop!) ||
                      (rules.debuffs.adFatigue?.freqRise!==undefined && freq >= rules.debuffs.adFatigue!.freqRise!) )
  // 반품률(대략) — returns / orders (0~1)
  const returnsRate = kpi.orders? (kpi.returns||0)/kpi.orders : 0
  const returnsHigh = returnsRate >= 0.03 // 3% 기준

  return { adFatigue, returnsHigh, returnsRate }
}
