
# ZP Command v3 업그레이드 패치 (C0/C1/C4/DQ/Report)
업로드 위치: 리포 루트. 기존 파일과 경로가 같으면 덮어쓰기 됩니다.

포함:
- app/_lib/patch_calc.ts : 계산 유틸(덮지 않고 병행)
- app/_lib/patch_loader.ts : csv 로더(기존 ../_lib/csv 있으면 자동 사용, 없으면 /public/data에서 fetch)
- app/page.tsx : C0 지휘소 업그레이드(전일/전주 대비, 캡 게이지 툴팁)
- app/growth/page.tsx : C1 리그 테이블 + 상위20% 토글
- app/rewards/page.tsx : C4 락업 남은 일수 배지
- app/decisions/page.tsx : DQ 자동 권고 + 로컬 로그
- app/report/page.tsx : 리포트 3줄 요약 + PDF 인쇄 버튼

적용:
1) 이 폴더를 ZIP으로 올리거나, 파일들을 리포 루트에 업로드(덮어쓰기)
2) 커밋 → Vercel 자동 재배포
3) /, /growth, /rewards, /decisions, /report 확인

주의:
- CSV가 비어 있으면 화면도 비어 보입니다. /public/data 또는 환경변수 매핑으로 최소 1~2줄 채워주세요.
