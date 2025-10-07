// app/_lib/rules.ts
import { readCsvLS, writeCsvLS } from './readCsv';

export type Rules = {
  barbell: { stableMin: number; stableMax: number; edgeMin: number; edgeMax: number };
  capRatio: number;                 // 보상 캡 비율 (ex: 0.2)
  triggers: {
    dailyLoop: { stablePct: number; edgePct: number; cooldownH: number };
  };
  debuffs: {
    returnsSpike: { threshold: number; days: number; payoutCut: number };
    adFatigue:    { ctrDrop: number; freqRise: number };
  };
};

const DEFAULT_RULES: Rules = {
  barbell: { stableMin: 0.4, stableMax: 0.7, edgeMin: 0.3, edgeMax: 0.6 },
  capRatio: 0.2,
  triggers: {
    dailyLoop: { stablePct: 1.0, edgePct: 0.5, cooldownH: 20 },
  },
  debuffs: {
    returnsSpike: { threshold: 0.03, days: 7, payoutCut: 0.5 },
    adFatigue: { ctrDrop: 0.2, freqRise: 0.3 },
  },
};

const LS_KEY = 'zp3.rules.json';

export function loadRules(): Rules {
  if (typeof window === 'undefined') return DEFAULT_RULES;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return DEFAULT_RULES;
  try {
    const obj = JSON.parse(raw);
    return { ...DEFAULT_RULES, ...obj };
  } catch {
    return DEFAULT_RULES;
  }
}

export function saveRules(r: Rules): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(r));
}

// 조건평가(간단 가드)
export function evalGuards(
  ctx: { revenue: number; ad_cost: number; orders: number; visits: number; returns: number; freq?: number; ctr?: number },
  rules: Rules
) {
  const retRate = ctx.orders ? ctx.returns / ctx.orders : 0;
  const returnsHigh = retRate > rules.debuffs.returnsSpike.threshold;
  const adFatigue = (ctx.ctr ?? 0) < rules.debuffs.adFatigue.ctrDrop && (ctx.freq ?? 0) > rules.debuffs.adFatigue.freqRise;
  return { returnsHigh, adFatigue };
}
