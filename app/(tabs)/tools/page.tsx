'use client';

import dynamic from 'next/dynamic';

// (안전) 클라이언트 전용 위젯이므로 SSR 비활성화 로드
<p className="text-sm" style={{margin:'8px 0', opacity:.8}}>
  필수 헤더: <code>date, channel, visits, clicks, carts, orders, revenue, ad_cost, returns</code>
</p>

const CsvWizard = dynamic(() => import('../../_components/CsvWizard'), { ssr: false });

export default function ToolsPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">도구</h2>
      <p className="opacity-70 mb-4">
        템플릿/데모로 채우고 검증 후 저장하시면, 각 탭(리포트/유입/보상)이 즉시 갱신됩니다.
      </p>
      <CsvWizard />
    </div>
  );
}

