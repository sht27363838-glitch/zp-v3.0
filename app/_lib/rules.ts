// 룰/가드(계약 고정) — LS 저장 및 SSR 안전
'use client';

import { num } from './num';

export type Rules = {
  capRatio: number; // 0.10
  barbell: { stableMin:number; stableMax:number; edgeMin:number; edgeMax:number };
  lockups: { stableDays:number; edgeDays:number };
  debuffs: {
    adFatigue: { freq:number; ctrLt:number; edgeLock:boolean; stableFloorPct:number };
    returnsSpike: { rateGt:number; payoutCut:number };
  };
  triggers: {
    dailyLoop:  { stablePct:number; edgePct:number; cooldownH:number };
    weeklyBoss: { stablePct:number; edgePct:number; cooldownD:number };
    monthlyBoss:{ stablePct:number; edgePct:number; cooldownD:number };
  };
};

const DEFAULT_RULES: Rules = {
  capRatio: 0.10,
  barbell: { stableMin:0.70, stableMax:0.85, edgeMin:0.15, edgeMax:0.30 },
  lockups: { stableDays:7, edgeDays:30 },
  debuffs: {
    adFatigue: { freq:3.0, ctrLt:0.006, edgeLock:true, stableFloorPct:0.2 },
    returnsSpike: { rateGt:0.03, payoutCut:0.5 }
  },
  triggers: {
    dailyLoop:  { stablePct:0.2, edgePct:0.0, cooldownH:24 },
    weeklyBoss: { stablePct:2.0, edgePct:0.5, cooldownD:7 },
    monthlyBoss:{ stablePct:5.0, edgePct:1.0, cooldownD:30 },
  }
};

const KEY = 'rules:v1';
const hasWindow = () => typeof window !== 'undefined';

export const loadRules = (): Rules => {
  if (!hasWindow()) return DEFAULT_RULES;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return DEFAULT_RULES;
  try { return { ...DEFAULT_RULES, ...JSON.parse(raw) }; }
  catch { return DEFAULT_RULES; }
};

export const saveRules = (r: Rules) => {
  if (!hasWindow()) return;
  window.localStorage.setItem(KEY, JSON.stringify(r));
};

// KPI로 경보 판정
export function evalGuards(kpi: {revenue:number; ad_cost:number; orders:number; visits:number; returns:number; freq:number; ctr:number}, r: Rules){
  const returnsRate = kpi.orders ? kpi.returns / kpi.orders : 0;
  const adFatigue = (kpi.freq >= r.debuffs.adFatigue.freq) && (kpi.ctr < r.debuffs.adFatigue.ctrLt);
  const returnsHigh = returnsRate > r.debuffs.returnsSpike.rateGt;
  return { adFatigue, returnsHigh };
}
