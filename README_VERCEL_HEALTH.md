# Vercel Health Patch (v3.0)
1) 이 ZIP을 리포 루트에 업로드(덮어쓰기) → 커밋
2) Vercel 재배포 → /health 페이지로 이동
3) 카운트가 0이면 /public/data/ CSV가 없거나, ZP_DATA_SOURCES 또는 /data 화면의 localStorage 매핑이 비었습니다.
