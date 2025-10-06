// app/_lib/rules.ts
import type { Rules } from './contracts';

const LS_KEY = 'rules.json';

export const defaultRules: Rules = {
  capRatio: 0.10,
  barbell: { stableMin: 0.70, stableMax: 0.85, edgeMin: 0.15, edgeMax: 0.30 },
  lockups: { stableDays: 7, edgeDays: 30 },
  debuffs: {
    adFatigue:   { freqGt: 3.0, ctrLt: 0.006 }, // CTR 0.6% 미만 & 빈도>3
    returnsSpike:{ rateGt: 0.03, payoutCut: 0.5 },
  },
  triggers: {
    dailyLoop:   { stablePct: 0.2, edgePct: 0.0, cooldownH: 24 },
    weeklyBoss:  { stablePct: 2.0, edgePct: 0.5, cooldownD: 7 },
    monthlyBoss: { stablePct: 5.0, edgePct: 1.0, cooldownD: 30 },
  },
};

export function loadRules(): Rules {
  if (typeof window === 'undefined') return defaultRules;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return defaultRules;
  try {
    const parsed = JSON.parse(raw) as Rules;
    // 부족한 필드 보정(앞으로 스키마 확장시 안전)
    return { ...defaultRules, ...parsed,
      barbell: { ...defaultRules.barbell, ...parsed.barbell },
      lockups: { ...defaultRules.lockups, ...parsed.lockups },
      debuffs: {
        adFatigue:   { ...defaultRules.debuffs.adFatigue, ...(parsed.debuffs?.adFatigue||{}) },
        returnsSpike:{ ...defaultRules.debuffs.returnsSpike, ...(parsed.debuffs?.returnsSpike||{}) },
      },
      triggers: {
        dailyLoop:   { ...defaultRules.triggers.dailyLoop, ...(parsed.triggers?.dailyLoop||{}) },
        weeklyBoss:  { ...defaultRules.triggers.weeklyBoss, ...(parsed.triggers?.weeklyBoss||{}) },
        monthlyBoss: { ...defaultRules.triggers.monthlyBoss, ...(parsed.triggers?.monthlyBoss||{}) },
      }
    };
  } catch {
    return defaultRules;
  }
}

export function saveRules(rules: Rules) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(rules));
}

// KPI 스냅샷으로 경보/잠금 여부 계산
export function evalGuards(
  kpi: { revenue:number; ad_cost:number; orders:number; visits:number; returns:number; freq:number; ctr:number },
  rules: Rules
){
  const cr  = kpi.visits>0 ? (kpi.orders/kpi.visits) : 0;
  const roas= kpi.ad_cost>0 ? (kpi.revenue/kpi.ad_cost) : 0;
  const returnsRate = kpi.orders>0 ? (kpi.returns/kpi.orders) : 0;

  const adFatigue   = (kpi.freq > rules.debuffs.adFatigue.freqGt) && (kpi.ctr < rules.debuffs.adFatigue.ctrLt);
  const returnsHigh = (returnsRate > rules.debuffs.returnsSpike.rateGt);

  return { cr, roas, returnsRate, adFatigue, returnsHigh };
}

export type { Rules } from './contracts';
