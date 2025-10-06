// app/_lib/contracts.ts

// ✅ CSV 데이터셋 키(프로젝트 전역 고정)
export type DatasetKey =
  | 'kpi_daily'
  | 'ledger'
  | 'creative_results'
  | 'rebalance_log'
  | 'commerce_items'
  | 'subs'
  | 'returns'
  | 'settings';

export const datasetKeys: DatasetKey[] = [
  'kpi_daily',
  'ledger',
  'creative_results',
  'rebalance_log',
  'commerce_items',
  'subs',
  'returns',
  'settings',
];

// ✅ CSV 파싱 결과 타입
export type CsvRow = Record<string, string>;
export type CsvRows = CsvRow[];

// ✅ 각 데이터셋 필수 헤더(검증용)
export const requiredHeaders: Record<DatasetKey, string[]> = {
  kpi_daily: [
    'date','channel','visits','clicks','carts','orders','revenue','ad_cost','returns','reviews'
  ],
  ledger: [
    'date','mission','type','stable','edge','note','lock_until'
  ],
  creative_results: [
    'date','creative_id','impressions','clicks','spend','orders','revenue'
  ],
  rebalance_log: [
    'date','from_to','amount','reason'
  ],
  commerce_items: [
    'order_id','sku','qty','price','discount','source'
  ],
  subs: [
    'customer_id','start_date','billing_n','status'
  ],
  returns: [
    'order_id','sku','reason','date'
  ],
  settings: [
    'last_month_profit','cap_ratio','edge_min','edge_max'
  ],
};

// ✅ 룰/보상 스키마(화면 에디터/가드 공용)
export interface Rules {
  capRatio: number; // 0.10 = 10%
  barbell: {
    stableMin: number; // 0.70
    stableMax: number; // 0.85
    edgeMin: number;   // 0.15
    edgeMax: number;   // 0.30
  };
  lockups: {
    stableDays: number; // 7
    edgeDays: number;   // 30
  };
  debuffs: {
    adFatigue: { freqGt: number; ctrLt: number };     // 예: 빈도>3 & CTR<0.6%
    returnsSpike: { rateGt: number; payoutCut: number }; // 반품률>3% → 0.5배
  };
  triggers: {
    dailyLoop:  { stablePct: number; edgePct: number; cooldownH: number };
    weeklyBoss: { stablePct: number; edgePct: number; cooldownD: number };
    monthlyBoss:{ stablePct: number; edgePct: number; cooldownD: number };
  };
}
