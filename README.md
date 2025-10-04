# ZP Command v3.0 — Next.js + Supabase

**목표:** v2.x(정적/PWA)에서 **Next.js(App Router)** + **Supabase** 백엔드로 확장.  
권한/멀티브랜드/감사로그/배포 채널(스테이징/프로덕션) 체계로 업그레이드.

## 빠른 시작 (CSV만으로도 동작)
```bash
npm install
npm run dev
# http://localhost:3000
```
- 모든 화면은 `/public/data/*.csv` 를 기본으로 읽습니다.
- 원격 CSV를 쓰려면:
  - `.env.local` 에 `ZP_DATA_SOURCES` 추가 또는
  - **/data** 화면에서 공유 링크 저장(localStorage)

## Supabase 연결(선택)
1. [Supabase](https://supabase.com) 프로젝트 생성 → `Project URL`, `anon key` 획득
2. **SQL Editor** 에 `supabase/schema.sql` 실행 (테이블 + RLS)
3. `.env.local` 작성:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
4. (선택) 인증을 붙이면 쓰기(ledger 적립 등)를 서버 액션으로 확장 가능

## 배포
- **Vercel 추천**: 버튼 클릭 → 환경변수 설정만 하면 완료
- **Netlify**: Framework = Next.js / Build = `npm run build` / Publish = `.next` (또는 Netlify Next Adapter)

## 폴더
- `app/` — App Router 페이지들
- `app/_lib` — csv 로더/계산/supabase 클라이언트
- `app/_components` — UI 컴포넌트
- `public/data/` — 샘플 CSV
- `supabase/schema.sql` — DB 스키마 & RLS

## 역할/권한(제안)
- viewer: 읽기 전용(익명 가능)
- operator: 쓰기(ledger 적립, experiments 기록)
- admin: 모든 권한 + 감사 로그 접근

## 스테이징/프로덕션 분리
- Vercel 환경변수에서 각 브랜치에 다른 **Supabase URL/Key** 세팅
- Git 브랜치: `main`(prod), `dev`(staging)

## 다음 단계(3.1+ 제안)
- 서버 액션으로 **/rewards** 적립 버튼 → Supabase `ledger` insert
- **brand_id** 기준 멀티브랜드 필터 UI
- **감사 로그** 테이블 추가 (모든 변경 이력 저장)
- 인증(Email OTP/Third-party) + 역할별 가드 미들웨어
