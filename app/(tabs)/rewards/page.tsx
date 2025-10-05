'use client';

import React, { useMemo } from 'react';
import { readCsvLS, parseCsv } from '../../_lib/readCsv';
import { num, fmt } from '../../_lib/num';

type Row = Record<string, string>;

function pickAmount(row: Row, candidates: string[]) {
  for (const k of candidates) {
    if (k in row) return num(row[k]);
  }
  return 0;
}

export default function RewardsPage() {
  // 로컬스토리지의 ledger CSV 로드
  const raw = readCsvLS('ledger') || '';
  // 🔧 핵심 수정: parseCsv(raw) 자체가 행 배열을 반환하므로 .rows 제거
  const rows: Row[] = useMemo(() => (raw ? (parseCsv(raw) as Row[]) : []), [raw]);

  // 합계 계산 (한국어/영문 헤더 모두 대응)
  const totals = useMemo(() => {
    let stable = 0; // 안정/정산
    let pledge = 0; // 잇지/예약
    for (const r of rows) {
      stable += pickAmount(r, ['안정', 'stable', 'settled']);
      pledge += pickAmount(r, ['잇지', 'pledge', 'promised']);
    }
    return { stable, pledge, total: stable + pledge };
  }, [rows]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Rewards (Ledger)</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="opacity-70 text-sm mb-1">안정 합계</div>
          <div className="text-xl font-semibold">{fmt(totals.stable)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="opacity-70 text-sm mb-1">잇지 합계</div>
          <div className="text-xl font-semibold">{fmt(totals.pledge)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="opacity-70 text-sm mb-1">총 보상</div>
          <div className="text-xl font-semibold">{fmt(totals.total)}</div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3">일자</th>
              <th className="px-4 py-3">미션</th>
              <th className="px-4 py-3">유형</th>
              <th className="px-4 py-3">안정</th>
              <th className="px-4 py-3">잇지</th>
              <th className="px-4 py-3">비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 opacity-70" colSpan={6}>
                  데이터가 없습니다. <b>도구</b> 탭에서 <code>ledger</code> CSV를 저장해 주세요.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="odd:bg-white/[0.02]">
                  <td className="px-4 py-3">{r['date'] || r['일자'] || ''}</td>
                  <td className="px-4 py-3">{r['mission'] || r['미션'] || ''}</td>
                  <td className="px-4 py-3">{r['type'] || r['유형'] || ''}</td>
                  <td className="px-4 py-3">
                    {fmt(pickAmount(r, ['안정', 'stable', 'settled']))}
                  </td>
                  <td className="px-4 py-3">
                    {fmt(pickAmount(r, ['잇지', 'pledge', 'promised']))}
                  </td>
                  <td className="px-4 py-3">{r['note'] || r['비고'] || ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
