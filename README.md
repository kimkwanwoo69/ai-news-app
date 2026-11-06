# AI News Collector

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 결과를 카드로 보여주는 웹 앱입니다. 마음에 드는 뉴스는 버튼 한 번으로 Notion 데이터베이스에 저장할 수 있습니다.

## 주요 기능

- **로그인(Clerk):** 모든 페이지와 API는 로그인한 사용자만 접근할 수 있습니다.
- **뉴스 가져오기:** 버튼을 누르면 TechCrunch AI, The Verge AI 피드를 읽고, DB에 없는 새 기사만 Claude로 번역·요약·분류합니다. 완료 후 `신규 N건, 실패 M건`을 보여 줍니다.
- **카드 목록:** 한국어 제목·요약, 출처, 발행일, 카테고리를 최신순으로 보여 주며 카테고리 필터와 페이지네이션을 지원합니다.
- **카테고리 관리:** 추가·수정·삭제가 가능합니다. 설명은 Claude가 분류할 때 참고하는 힌트로 쓰이고, 변경은 이후 수집하는 기사부터 반영됩니다. 삭제하면 해당 기사는 '기타'가 됩니다.
- **뉴스 저장:** 카드의 `뉴스 저장` 버튼을 누르면 Notion DB에 페이지가 생기고 버튼이 `저장됨`으로 바뀝니다(중복 저장 방지). `저장됨`을 누르면 Notion 페이지가 열립니다.

뉴스와 카테고리는 모든 사용자가 공유합니다(사용자별 분리 없음).

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| 로그인 | Clerk |
| 데이터베이스 | Neon (Postgres) + Drizzle ORM |
| 번역·요약·분류 | Claude API (`@anthropic-ai/sdk`) |
| RSS | `rss-parser` |
| Notion 저장 | `@notionhq/notion-mcp-server` (앱 서버가 MCP 클라이언트로 연결) |

## 시작하기

### 1. 사전 준비

- Clerk, Neon, Anthropic 계정과 키
- Notion 통합(Integration) 토큰
- Notion에 저장용 데이터베이스를 만들고 위 통합을 연결합니다. 속성 이름과 유형은 아래와 같아야 합니다.

| 속성 | 유형 |
|---|---|
| 제목 | 제목(title) |
| 요약 | 텍스트 |
| 출처 | URL |
| 카테고리 | 선택(select) |
| 날짜 | 날짜 |

### 2. 환경 변수

프로젝트 루트에 `.env.local`을 만들고 값을 채웁니다. 모두 서버 전용이며 커밋하지 않습니다.

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon Postgres
DATABASE_URL=

# Anthropic
ANTHROPIC_API_KEY=

# Notion
NOTION_TOKEN=
NOTION_DATABASE_ID=
```

### 3. 설치와 실행

```bash
npm install
npm run db:migrate   # 테이블 생성
npm run db:seed      # 기본 카테고리 입력
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 로그인 후 `/dashboard`로 이동합니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | 타입 검사 |
| `npm run db:generate` | 스키마 변경으로 마이그레이션 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |
| `npm run db:seed` | 기본 카테고리 입력 |
| `npm run db:seed:samples` | 샘플 기사 입력 |

## 프로젝트 구조

```
src/
├─ app/
│  ├─ dashboard/            # 뉴스 카드 목록 화면
│  └─ api/
│     ├─ news/fetch/        # 뉴스 가져오기(RSS → Claude → DB)
│     ├─ categories/        # 카테고리 추가·수정·삭제
│     └─ articles/[id]/notion/   # Notion 저장
├─ components/              # NewsBoard, NewsCard, CategoryBar 등
├─ db/                      # Drizzle 스키마, 쿼리, 시드
└─ lib/
   ├─ rss/                  # 피드 목록, 수집, ingest
   ├─ ai/                   # Claude 번역·요약·분류
   └─ notion/               # Notion MCP 클라이언트
```

## 문서

- [`PRD.md`](PRD.md): 범위, 데이터 모델, 구현 순서
- [`ui.md`](ui.md): UI 스타일 가이드(색상 토큰, 카드, 화면 상태)

## 참고

- 한 번에 처리하는 기사 수와 수집 기간은 `src/lib/rss/feeds.ts`에서 조정합니다(피드당 최근 10건, 최근 24시간).
- RSS, Claude, Notion 호출이 실패해도 앱은 멈추지 않고 화면에 오류 메시지를 보여 줍니다.
