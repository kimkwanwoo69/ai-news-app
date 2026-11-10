# UI 가이드 — AI 뉴스 수집기

앱 이름은 **AI 뉴스 수집기**이고, 메인 화면은 뉴스를 카드로 보여 주는 **대시보드**다.
스타일은 Tailwind CSS(v4)로 작성하며, 깔끔하고 읽기 편한 느낌을 목표로 한다.

## 1. 디자인 원칙

- **여백을 넉넉하게.** 카드와 섹션 사이 간격을 충분히 두어 답답하지 않게 한다.
- **한 화면에 강조는 하나.** 파란색 강조는 현재 선택·주요 버튼·링크 호버에만 쓴다.
- **본문 가독성 우선.** 본문은 `text-sm`~`text-base`, 줄 간격 `leading-relaxed`, 긴 문단은 줄 수를 제한한다.
- **장식 최소화.** 얇은 테두리와 약한 그림자만 쓴다. 그라디언트·진한 그림자는 쓰지 않는다.
- **다크 모드 지원.** `prefers-color-scheme`에 따라 색 토큰만 바뀌고, 컴포넌트 클래스는 그대로 둔다.

## 2. 색상 토큰

색은 `src/app/globals.css`의 CSS 변수로 정의하고 `@theme inline`으로 Tailwind에 연결한다.
컴포넌트에서는 `bg-primary`, `text-muted`처럼 **토큰 이름만** 사용하고 hex 값을 직접 쓰지 않는다.

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `background` | `#f5f8fd` | `#0b1220` | 페이지 배경 |
| `surface` | `#ffffff` | `#111b2e` | 카드·헤더 배경 |
| `foreground` | `#14213d` | `#e6edf8` | 기본 글자색 |
| `muted` | `#5b6b86` | `#93a4c0` | 보조 글자(출처, 날짜) |
| `border` | `#dbe5f4` | `#1f2e4a` | 테두리·구분선 |
| `primary` | `#2563eb` | `#3b82f6` | 주 색상(버튼, 선택 상태) |
| `primary-hover` | `#1d4ed8` | `#60a5fa` | 주 색상 호버 |
| `primary-soft` | `#e8f0fe` | `#14284d` | 옅은 파랑 배경(카테고리 배지) |
| `primary-soft-text` | `#1e40af` | `#93c5fd` | 옅은 파랑 위 글자 |

## 3. 타이포그래피

폰트는 `layout.tsx`의 Geist(`--font-geist-sans`)를 사용한다. `body`에 `font-sans`가 적용되도록 하고, 별도 폰트를 지정하지 않는다.

| 요소 | 클래스 |
|---|---|
| 앱 이름(헤더) | `text-lg font-bold text-primary` |
| 카드 제목 | `text-lg font-semibold leading-snug tracking-tight text-balance` |
| 카드 원문 제목 | `text-xs text-muted` (한 줄 말줄임) |
| 카드 요약 | `text-sm leading-7 text-pretty text-foreground/85` (최대 4줄) |
| 카드 출처 | `text-xs font-medium text-foreground/80` |
| 메타 정보(날짜·작성자) | `text-xs text-muted` |

## 4. 레이아웃

- 전체: `body`는 `min-h-full flex flex-col`. 콘텐츠 폭은 `mx-auto w-full max-w-6xl px-4 sm:px-6` (모바일 좌우 여백 16px, 태블릿부터 24px).
- 구조 (위에서 아래로)
  1. **헤더** — 앱 이름 `AI 뉴스 수집기`, 오른쪽에 `뉴스 가져오기` 버튼과 `UserButton`
  2. **뉴스 개수 배지** — 대시보드 상단, 검색 바 위 (5-2 참고)
  3. **검색 바** — 카테고리 바 위
  4. **카테고리 바** — 뉴스 카드 목록 바로 위
  5. **뉴스 카드 그리드**
- 헤더는 `sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur`. 오류 화면에서도 유지되도록 `dashboard/layout.tsx`에 둔다.
- 카드 그리드: `grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3` (모바일 1열 → 태블릿 2열 → 데스크톱 3열).
- 카테고리 바와 그리드 사이 간격은 `mb-6`.

```
┌──────────────────────────────────────────────────────┐
│ AI 뉴스 수집기                 [뉴스 가져오기]  (👤)  │  ← 헤더
├──────────────────────────────────────────────────────┤
│ (총 20개의 뉴스)                                      │  ← 뉴스 개수 배지
│ [키워드 검색…              ] [검색]                   │  ← 검색 바
│ [전체] [모델/연구] [제품/서비스] [기타] [+ 카테고리]   │  ← 카테고리 바
│                                                      │
│ ┌────────┐  ┌────────┐  ┌────────┐                   │
│ │ 카드   │  │ 카드   │  │ 카드   │                   │  ← 뉴스 카드 그리드
│ └────────┘  └────────┘  └────────┘                   │
└──────────────────────────────────────────────────────┘
```

## 5. 카테고리 바

뉴스 카드 목록 **위**에 카테고리를 가로로 나열하고, **맨 끝에 카테고리 추가 버튼**을 둔다.

- 컨테이너: `mb-6 flex flex-wrap items-center gap-2` (좁은 화면에서는 줄바꿈).
- 항목 순서: `전체` → DB의 카테고리들 → `기타` → **`+ 카테고리` 추가 버튼**.
- 카테고리 칩(공통): `rounded-full border px-4 py-2 text-sm transition-colors sm:py-1.5` (모바일 높이 약 40px, 태블릿부터 32px)
  - 선택됨: `border-primary bg-primary text-white`
  - 선택 안 됨: `border-border bg-surface text-muted hover:border-primary hover:text-primary`
- **추가 버튼**은 칩과 같은 크기이되 점선 테두리로 구분한다.
  - 클래스: `rounded-full border border-dashed border-primary/50 px-4 py-1.5 text-sm text-primary transition-colors hover:bg-primary-soft`
  - 라벨: `+ 카테고리`
  - 클릭하면 이름·설명을 입력하는 작은 모달(또는 인라인 폼)이 열린다. 설명은 AI 분류 힌트로 쓰이므로 입력란 안내문에 그 취지를 적는다.
- 항목 순서에서 `기타`는 항상 추가 버튼 바로 앞(카테고리 맨 뒤)에 둔다. 새로 추가한 카테고리는 `기타` 앞에 들어간다.
- **수정·삭제:** 선택된 카테고리 칩 바로 옆에 연필 아이콘 버튼(`aria-label="{이름} 카테고리 편집"`)이 나타난다. 누르면 추가와 같은 모달이 이름·설명 채운 상태로 열리고, 하단에 `삭제` 버튼이 있다. `전체`와 `기타`는 편집·삭제할 수 없다.
- 이름은 필수(30자 이하)이며 중복할 수 없다. 설명은 200자 이하. 중복·검증 오류는 모달 안에 오류 배너(`bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300`)로 보여 준다.
- 수정은 **이후 수집부터** 분류에 반영되고, 이미 저장된 기사는 다시 분류하지 않는다. 모달 안내문에 적는다.
- 카테고리를 삭제하면 해당 기사는 `기타`로 표시된다는 점을 삭제 확인 문구에 명시한다. 삭제는 모달 안에서 한 번 더 확인(`삭제할까요?` → `삭제` / `취소`)한다.
- 모달은 네이티브 `<dialog>`(`showModal`)를 쓴다: Esc로 닫히고 포커스가 갇힌다. 패널 `w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-5 text-foreground`, 배경 `backdrop:bg-black/40`.

## 5-2. 뉴스 개수 배지

대시보드 맨 위(검색 바 위)에 DB에 저장된 **전체 뉴스 개수**를 알려 주는 배지를 둔다.

- 문구: `총 {N}개의 뉴스` (예: `총 20개의 뉴스`). 검색·카테고리 필터와 상관없이 DB 전체 개수를 보여 준다.
- 클래스: `mb-4 inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary-soft-text` (카테고리 배지와 같은 옅은 파랑 톤, 강조는 늘리지 않는다).
- 개수는 서버에서 DB `count(*)`로 조회한다. 뉴스를 가져오거나 삭제한 뒤 화면을 새로고침하면 갱신된다.
- 개수가 0이어도 `총 0개의 뉴스`로 표시한다.

## 5-1. 검색 바

카테고리 바 **위**에 키워드 입력란과 `검색` 버튼을 한 줄로 둔다.

- 폼: `mb-4 flex gap-2` (`<form role="search">`). 입력란 `h-10 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 text-sm`, 포커스 시 `border-primary` + 공통 포커스 링. `placeholder="키워드로 뉴스 검색"`, `aria-label="뉴스 검색어"`.
- `검색` 버튼(`type="submit"`): `h-10 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover`. 클릭하거나 입력란에서 Enter를 누르면 검색한다. 입력만 해서는 필터되지 않는다.
- 대상: 한국어 제목·원문 제목·요약·작성자·출처. 대소문자 무시, 공백으로 나눈 단어를 모두 포함해야 한다(AND).
- 카테고리 선택과 함께 적용되고, 검색하면 1페이지로 돌아간다. 빈 검색어로 검색하면 검색이 해제된다.
- 검색 중이면 입력란 오른쪽에 `지우기` 버튼이 나타나 검색어를 비우고 해제한다.
- 결과 없음: 제목 `검색 결과가 없어요`, `전체 보기` 버튼은 검색어·카테고리를 모두 해제한다.

## 6. 뉴스 카드

카드 한 장은 한 기사를 나타낸다. 구조는 위에서 아래로 **배지·날짜 → 제목 → 요약 → 푸터**.

```
┌──────────────────────────────┐
│ [카테고리]     2026년 11월 5일 ✕ │  ← 상단: 카테고리 배지 · 날짜 · 삭제(호버 시)
│ 한국어 제목 (최대 3줄)           │
│ Original English title          │  ← 원문 제목(옅게, 한 줄)
│ 한국어 요약 …(최대 4줄)          │
│ ───────────────────────────── │
│ TechCrunch AI          [저장]   │  ← 푸터: 출처(굵게)·작성자(옅게) · 저장 버튼
│ 작성자                          │
└──────────────────────────────┘
```

- 카드 컨테이너:
  `group relative flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 sm:p-5 hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5`
- **카드 전체가 클릭 영역.** 제목 링크에 `after:absolute after:inset-0`(stretched link)을 주어 카드 어디를 눌러도 원문이 열린다. 삭제·저장 버튼과 Notion 링크는 `relative z-10`으로 위에 둔다.
- 카테고리 배지: `rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-text`. 분류가 없으면 `기타`.
- 제목은 원문 기사로 연결되는 링크(`target="_blank" rel="noopener noreferrer"`). 카드에 호버(`group-hover`)하면 `text-primary`와 밑줄(`underline decoration-primary/40 underline-offset-4`)이 나타난다.
- 삭제 버튼은 데스크톱(`sm:`)에서 평소 `opacity-0`, 카드 호버·포커스 시 `opacity-100`. 모바일·터치에서는 항상 보인다.
- 푸터: `mt-auto border-t border-border pt-4`. 카드 높이가 달라도 푸터가 아래에 정렬되도록 한다. 왼쪽에 출처(굵게)와 작성자(옅게)를 세로로 쌓는다.
- 작성자(`author`)가 없으면 해당 줄을 숨기고, 발행일(`publishedAt`)이 없으면 날짜도 숨긴다. 날짜는 `2026년 11월 5일` 형식.
- 카드 호버 움직임은 `motion-safe:`로만 적용한다(움직임 줄이기 설정 존중).

### Notion 저장 버튼 상태

| 상태 | 표시 | 스타일 |
|---|---|---|
| 미저장 | `뉴스 저장` | `rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover` |
| 저장 중 | `저장 중…` | 위와 같고 `disabled:opacity-50` |
| 저장됨(`notionPageUrl` 있음) | `저장됨` | `bg-primary-soft text-primary-soft-text`, 클릭 시 Notion 페이지를 새 탭으로 열기. 중복 저장 방지 |

## 7. 상태별 화면

- **로그아웃 상태:** 중앙 정렬. 앱 이름(`text-3xl font-semibold text-primary`), 안내 문구(`text-muted`), `로그인`(채움 파랑) / `회원가입`(`border-border bg-surface text-primary`) 버튼 두 개. 모든 페이지가 로그인 필수다.
- **빈 상태(뉴스 없음):** 카테고리 칩은 숨기고, 점선 테두리 안내 카드(`rounded-2xl border border-dashed border-border bg-surface py-14 text-center`)를 보여 준다. 파란 원형 아이콘, 제목 `아직 수집한 뉴스가 없어요`, 설명 `뉴스를 가져오면 이곳에 카드로 정리돼요.` 순서. `뉴스 가져오기` 버튼이 생기면 안내 카드 안에 같은 버튼을 둔다.
- **필터 결과 없음:** 같은 안내 카드에 제목 `이 카테고리에 해당하는 뉴스가 없어요`와 `전체 보기` 버튼(채움 파랑)을 둔다.
- **로딩:** 가져오는 동안 `뉴스 가져오기` 버튼을 비활성화하고 `가져오는 중…`으로 바꾼다. 카드 자리는 실제 카드와 같은 구조의 스켈레톤을 쓴다(`motion-safe:animate-pulse`, 높이가 달라 화면이 출렁이지 않게). 컨테이너에 `role="status"`와 `sr-only` 문구 `뉴스를 불러오는 중…`을 둔다. `뉴스 가져오기`가 진행되는 동안(요청 + 목록 갱신)에는 sr-only 문구는 `뉴스를 가져오는 중…`을 쓰고, 보드의 카드 그리드 맨 앞에 스켈레톤 카드 3장을 끼워 넣고, 기사가 없는 빈 상태에서는 안내 카드 대신 스켈레톤 그리드(컨테이너에 `role="status"`)를 보여 준다. 기사가 있을 때는 `role="status"` sr-only 문구를 따로 두고 스켈레톤 영역은 `aria-hidden`으로 숨긴다. 로그인 확인 중인 `/`에는 `불러오는 중…`을 보여 준다.
- **결과 안내:** 가져오기가 끝나면 `신규 N건, 실패 M건`을 토스트 또는 헤더 아래 배너(`bg-primary-soft text-primary-soft-text rounded-lg px-4 py-2 text-sm`)로 보여 준다.
- **오류:** RSS·Claude·Notion 호출 실패는 앱이 멈추지 않게 하고 사용자에게 보이는 오류 메시지로 알린다. 오류 배너는 파란 계열과 구분되도록 `bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300`를 쓴다.

## 8. 접근성·반응형

- 모든 버튼에 `type="button"`을 지정하고, 아이콘만 있는 버튼에는 `aria-label`을 붙인다.
- 선택된 카테고리 칩에 `aria-pressed="true"`를 지정한다.
- 키보드 포커스가 보이게 한다: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`.
- 본문 글자와 배경의 대비는 WCAG AA(4.5:1) 이상을 유지한다. `muted`는 본문이 아닌 보조 정보에만 쓴다.
- 클릭 영역은 모바일에서 40px 이상(칩 `py-2`, 버튼 `h-10`), 태블릿부터는 최소 32px.
- 가로 스크롤이 생기지 않아야 한다. 긴 제목·URL은 `break-words`로 처리한다.

## 9. 컴포넌트 구성 (예정)

| 컴포넌트 | 위치 | 역할 |
|---|---|---|
| `Header` | `src/components/header.tsx` | 앱 이름, 뉴스 가져오기 버튼, `UserButton` |
| `CategoryBar` | `src/components/category-bar.tsx` | 카테고리 칩 목록 + 추가 버튼 |
| `AddCategoryDialog` | `src/components/add-category-dialog.tsx` | 카테고리 이름·설명 입력 |
| `NewsCard` | `src/components/news-card.tsx` | 기사 한 장 표시, Notion 저장 버튼 |
| `NewsBoard` | `src/components/news-board.tsx` | 카테고리 칩 필터, 카드 그리드, 빈 상태 |

스타일 변경은 먼저 이 문서와 `globals.css`의 토큰을 고치고, 컴포넌트에서는 토큰 클래스만 사용한다.
