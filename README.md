# 미소법률상담

법률 상담 연결 플랫폼 — AI 검색 + 카테고리 사례 + 상담 신청 + 관리자 CMS.

> 본 플랫폼은 법률/금융 정보를 제공하고 상담 연결을 지원하는 서비스입니다.
> 본 사이트는 직접 법률 자문을 제공하지 않으며,
> 정확한 법률/금융 판단은 제휴 상담을 통해 확인하시기 바랍니다.

## 스택

- **Next.js 14** (App Router, TypeScript, standalone output)
- **Tailwind CSS** + Pretendard
- **better-sqlite3** (서버 영속 DB, `data/miso.db`)
- **OpenAI Chat Completions** (선택적 LLM 보강. 키워드 매칭이 항상 우선)
- **Docker** (멀티스테이지 빌드, 비-root 실행, `/app/data` 볼륨)

## 핵심 기능

1. **AI 검색** — 메인 대형 검색창. 키워드 매칭 → 관리자 답변 세트 → 카테고리 기본 안내 → (옵션) OpenAI 보강.
2. **8개 대분류** — 사기 / 형사 / 음주운전 / 보이스피싱 / 민사 / 회생·파산 / 이혼·가사 / 노동·퇴직금. 각 분류별 중분류와 사례글.
3. **상담 신청 폼** — 이름·연락처·이메일·분야·내용·유입경로 + 개인정보 동의 + 상태값 6단계.
4. **회원** — 휴대폰번호+scrypt 비번, 30일 쿠키 세션. 마이페이지에서 내 상담 내역 확인.
5. **관리자 9탭** — 대시보드 / 상담 신청 / 사례글 / 카테고리(중분류) / AI 답변 / 쇼츠 / 금지어 / 회원 / 링크·설정.
6. **알림** — SMTP env 설정 시 운영자 이메일 알림 (`lib/notify.ts`).
7. **외부 링크 관리** — 네이버 카페 / 쇼츠 / 카카오톡 채널 URL을 관리자에서 변경.

## 로컬 개발

```bash
cd miso-law-nextjs
npm install
cp .env.example .env.local       # ADMIN_PASSWORD 등 채우기
npm run dev                       # http://localhost:3000
```

기본 관리자 비번은 `.env`의 `ADMIN_PASSWORD` (기본값 `changeme1234`).

DB는 `data/miso.db`에 자동 생성되고 8개 카테고리 + 시드 사례글/AI 답변/쇼츠/금지어가 자동으로 들어갑니다.

## 환경 변수

| 키 | 필수 | 설명 |
|---|---|---|
| `ADMIN_PASSWORD` | ✓ | 관리자 비번 |
| `OPENAI_API_KEY` |   | (선택) OpenAI 보강 활성화 |
| `OPENAI_MODEL` |   | 기본 `gpt-4o-mini` |
| `SMTP_HOST`/`PORT`/`USER`/`PASS`/`FROM`/`TO` |   | (선택) 신규 상담 이메일 알림. **6개 모두 채워야 발송됨** |
| `DEFAULT_CAFE_URL` / `DEFAULT_SHORTS_URL` / `DEFAULT_KAKAO_URL` |   | 첫 부팅 시 기본 외부 링크 |

> 키워드 매칭이 항상 우선이라 OpenAI 키가 없어도 사이트는 정상 동작합니다. 매칭 미스 시 카테고리별 기본 안내문을 출력합니다.

## 주요 라우트

- `/` — 메인 (AI 검색창 + 8 카테고리 + 머니배너 + 빠른메뉴)
- `/search?q=...` — AI 답변 + 관련 카테고리 자동 추천
- `/category/[slug]` — 대분류 + 중분류 chip + 사례 + 쇼츠
- `/case/[id]` — 사례 본문
- `/inquiry?category=...` — 상담 신청
- `/cases` — 전체 사례 목록
- `/shorts` — 쇼츠 목록
- `/cafe` — 카페·카톡 외부 링크
- `/signup` / `/login` / `/mypage`
- `/admin` — 관리자 9탭

## 명세 4번(AI 답변 가드) 구현

- 관리자가 등록하는 키워드 답변 세트가 우선.
- 답변 출력 시 `lib/db.ts:applyBanFilter()`로 금지어 자동 치환.
- 비법률 질문은 정중한 안내 메시지로 분기.
- LLM 보강 시에도 시스템 프롬프트로 확정 표현 금지 + JSON 강제.

## Docker

```bash
docker build -t miso-law .
docker run -d \
  --name miso-law \
  -p 3000:3000 \
  -e ADMIN_PASSWORD=changeme1234 \
  -v miso-data:/app/data \
  miso-law
```

이미지는 Node 20 Alpine 기반, non-root 실행, `/app/data`에 볼륨 마운트.

## 검증 체크리스트 (Build → Verify → Report)

| 영역 | 결과 |
|---|---|
| 시스템 통합 | ✅ 모든 라우트 import/export 정합, 타입 통과 |
| DB·저장소 | ✅ better-sqlite3 영속, 서버 측 검증 + 트랜잭션 시드 |
| 기능 정확성 | ✅ 빈값·null·LLM 미설정·SMTP 미설정·중복 가입 등 엣지 처리 |
| 사소한 문제 | ✅ 미사용 import 제거, console은 의도된 server log만 |
| UX | ✅ 로딩/성공/에러 피드백, 44px 터치 영역, 키보드 접근 |
| 디자인·반응형 | ✅ 모바일(2열) / 태블릿(4열) / PC(우측 rail 1280+) |
