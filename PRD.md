# PRD: AI News Collector

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, Claude AI가 한국어로 번역·요약·카테고리 분류한 결과를 카드 형태로 보여주는 웹 앱. 마음에 드는 뉴스는 Notion에 저장할 수 있다.

## 2. 목표
- 해외 AI 뉴스를 한국어로 빠르게 훑어볼 수 있게 한다.
- 뉴스를 자동으로 카테고리별로 정리하고, 원하는 카테고리만 골라 볼 수 있게 한다.
- 필요한 뉴스를 클릭 한 번으로 Notion에 보관한다.

## 3. 범위
### 포함
- 로그인(Clerk), 로그인한 사용자만 앱 사용
- '뉴스 가져오기' 버튼으로 RSS 수집 → 한국어 번역/요약/분류
- 카드형 뉴스 목록, 카테고리 필터
- 카테고리 추가/수정/삭제
- 카드별 'Notion 저장' 버튼

### 제외 (이번 버전)
- 사용자별 데이터 분리 (뉴스·카테고리는 전체 공유)
- 자동/주기적 수집 (버튼 클릭 시에만 수집)
- 카테고리 변경 시 기존 기사 재분류
- 사용자별 Notion OAuth 연결

## 4. 뉴스 소스
| 이름 | RSS URL |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

## 5. 기능 요구사항
### F1. 로그인
- 앱 실행 시 로그인되어 있지 않으면 로그인 화면으로 이동한다.
- 모든 페이지와 API는 로그인 없이 접근할 수 없다.

### F2. 뉴스 가져오기
- 버튼 클릭 시 두 RSS 피드를 읽는다.
- 원문 URL이 이미 DB에 있는 기사는 건너뛰고, 새 기사만 처리한다.
- 새 기사마다 Claude가 제목·요약을 한국어로 번역/요약하고, 현재 카테고리 목록 중 하나로 분류한다. 목록에 없는 결과는 '기타'로 처리한다.
- 비용·시간 제어를 위해 피드당 최근 N건(기본 10건)만 처리하고 동시 호출 수를 제한한다.
- 일부 기사 처리가 실패해도 나머지는 계속 처리하며, 완료 후 "신규 N건 추가, 실패 M건"을 표시한다.
- 처리 중에는 로딩 상태를 보여준다.

### F3. 뉴스 카드 목록
- 카드 표시 항목: 한국어 제목, 한국어 요약, 출처, 발행일, 카테고리, 원문 링크, 'Notion 저장' 버튼
- 최신 발행일 순으로 정렬한다.
- 카테고리 필터로 해당 카테고리 뉴스만 볼 수 있다(전체 보기 포함).

### F4. 카테고리 관리
- 카테고리 추가, 이름/설명 수정, 삭제가 가능하다. 이름은 중복 불가.
- 설명은 Claude가 분류할 때 참고하는 힌트로 쓰인다.
- 기본 카테고리: 모델/제품, 연구, 투자/비즈니스, 규제/정책, 도구/활용, 기타
- 카테고리를 삭제하면 해당 기사는 미분류('기타')가 된다.
- 변경 내용은 이후 수집하는 기사의 분류부터 반영된다.

### F5. Notion 저장
- 카드의 'Notion 저장' 버튼 클릭 시 해당 뉴스를 Notion 데이터베이스에 페이지로 생성한다(제목, 요약, 카테고리, 출처, 원문 URL).
- 저장에 성공하면 Notion 페이지 URL을 기록하고 버튼을 '저장됨'으로 바꿔 중복 저장을 막는다.
- 실패 시 오류 메시지를 보여주고 다시 시도할 수 있다.

## 6. 기술 스택
| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js (App Router, TypeScript) |
| 로그인 | Clerk |
| 데이터베이스 | Neon (Postgres) + Drizzle ORM |
| 번역·요약·분류 | Claude API (`@anthropic-ai/sdk`) |
| 노션 저장 | Notion MCP 서버 (`@notionhq/notion-mcp-server`), 앱 서버가 MCP 클라이언트로 연결 |
| RSS 파싱 | `rss-parser` |

## 7. 데이터 모델
**categories**
- id, name (unique), description, createdAt

**articles**
- id, sourceName, url (unique), titleOriginal, titleKo, summaryKo
- author (nullable, 원문 기사 작성자)
- categoryId (FK → categories, 삭제 시 null), publishedAt, createdAt
- notionPageUrl (nullable)

## 8. 환경 변수
`CLERK_*`(publishable/secret key), `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_TOKEN`, `NOTION_DATABASE_ID`

## 9. 비기능 요구사항
- API 키 등 비밀 값은 서버에서만 사용하고 클라이언트에 노출하지 않는다.
- 외부 호출(RSS, Claude, Notion) 실패 시 앱이 중단되지 않고 사용자에게 오류를 알린다.
- 같은 기사가 중복 저장되지 않는다(URL unique).

## 10. 사전 준비 (사용자)
- Clerk, Neon, Anthropic, Notion 계정 및 키 발급
- Notion에 저장용 데이터베이스를 만들고 통합(Integration)을 연결한다. 속성: 제목, 요약, 카테고리, 출처, URL

## 11. 구현 순서
1. Next.js 초기화 + Clerk 로그인 보호
2. Neon 연결 + Drizzle 스키마/마이그레이션 + 기본 카테고리 시드
3. 카테고리 관리 화면
4. RSS 수집 + Claude 번역/요약/분류 + '뉴스 가져오기' 버튼
5. 카드 목록 + 카테고리 필터
6. Notion MCP 저장 버튼
7. 에러/로딩 상태 다듬기

## 12. 검증 기준
- 비로그인 접근 시 로그인 화면으로 이동한다.
- '뉴스 가져오기'를 연속 2회 실행하면 두 번째는 신규 0건이다.
- 카테고리 추가/수정/삭제가 필터와 이후 수집 분류에 반영된다.
- 'Notion 저장' 클릭 시 Notion DB에 페이지가 생기고 버튼이 '저장됨'으로 바뀐다.
- `npm run build`와 타입체크가 통과한다.
