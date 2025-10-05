import CsvWizard from '../../_components/CsvWizard';
export default function Tools(){ return (
  <div className='stack'>
    <section className='card'><h2>도구</h2><p className='muted'>① 템플릿 다운로드 → ② 값 입력 → ③ 업로드(로컬 저장) → ④ 리포트/유입/보상에서 확인</p><p className='badge warn'>샘플 레이아웃 정상</p></section>
    <CsvWizard/>
  </div>
);}

