// app/(tabs)/tools/page.tsx
import CsvWizard from '@/app/_components/CsvWizard';

export default function ToolsPage(){
  return (
    <div className="page">
      <h2 className="title">도구</h2>
      <p className="hint">템플릿/데모로 채우고 검증 후 저장하시면, 각 탭(리포트/유입/보상)이 즉시 갱신됩니다.</p>
      <CsvWizard/>
      <style jsx>{`
        .page{ padding:24px; }
        .title{ font-size:22px; font-weight:700; margin-bottom:8px; }
        .hint{ opacity:.7; margin-bottom:12px; }
      `}</style>
    </div>
  );
}
