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
| 카드 제목 | `text-lg font-semibold leading-snug` |
| 카드 원문 제목 | `text-xs text-muted` (한 줄 말줄임) |
| 카드 요약 | `text-sm leading-relaxed text-foreground/80` (최대 4줄) |
| 메타 정보(출처·날짜·작성자) | `text-xs text-muted` |

## 4. 레이아웃

- 전체: `body`는 `min-h-full flex flex-col`. 콘텐츠 폭은 `mx-auto w-full max-w-6xl px-6`.
- 구조 (위에서 아래로)
  1. **헤더** — 앱 이름 `AI 뉴스 수집기`, 오른쪽에 `뉴스 가져오기` 버튼과 `UserButton`
  2. **카테고리 바** — 뉴스 카드 목록 바로 위
  3. **뉴스 카드 그리드**
- 헤더는 `sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur`.
- 카드 그리드: `grid gap-5 sm:grid-cols-2 lg:grid-cols-3` (모바일 1열 → 태블릿 2열 → 데스크톱 3열).
- 카테고리 바와 그리드 사이 간격은 `mb-6`.

```
┌──────────────────────────────────────────────────────┐
│ AI 뉴스 수집기                 [뉴스 가져오기]  (👤)  │  ← 헤더
├──────────────────────────────────────────────────────┤
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
- 카테고리 칩(공통): `rounded-full border px-4 py-1.5 text-sm transition-colors`
  - 선택됨: `border-primary bg-primary text-white`
  - 선택 안 됨: `border-border bg-surface text-muted hover:border-primary hover:text-primary`
- **추가 버튼**은 칩과 같은 크기이되 점선 테두리로 구분한다.
  - 클래스: `rounded-full border border-dashed border-primary/50 px-4 py-1.5 text-sm text-primary transition-colors hover:bg-primary-soft`
  - 라벨: `+ 카테고리`
  - 클릭하면 이름·설명을 입력하는 작은 모달(또는 인라인 폼)이 열린다. 설명은 AI 분류 힌트로 쓰이므로 입력란 안내문에 그 취지를 적는다.
- 카테고리를 삭제하면 해당 기사는 `기타`로 표시된다는 점을 삭제 확인 문구에 명시한다.

## 6. 뉴스 카드

카드 한 장은 한 기사를 나타낸다. 구조는 위에서 아래로 **배지 → 제목 → 요약 → 푸터**.

```
┌──────────────────────────────┐
│ [카테고리]        TechCrunch AI │  ← 상단: 카테고리 배지 · 출처
│ 한국어 제목 (최대 2~3줄)         │
│ Original English title          │  ← 원문 제목(옅게, 한 줄)
│ 한국어 요약 …(최대 4줄)          │
│ ───────────────────────────── │
│ 작성자 · 2026년 11월 5일  [저장] │  ← 푸터: 메타 · Notion 저장 버튼
└──────────────────────────────┘
```

- 카드 컨테이너:
  `flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md`
- 카테고리 배지: `rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-text`. 분류가 없으면 `기타`.
- 제목은 원문 기사로 연결되는 링크(`target="_blank" rel="noopener noreferrer"`), 호버 시 `text-primary`.
- 푸터: `mt-auto border-t border-border pt-4`. 카드 높이가 달라도 푸터가 아래에 정렬되도록 한다.
- 작성자(`author`)가 없으면 해당 줄을 숨기고, 발행일(`publishedAt`)이 없으면 날짜도 숨긴다. 날짜는 `2026년 11월 5일` 형식.

### Notion 저장 버튼 상태

| 상태 | 표시 | 스타일 |
|---|---|---|
| 미저장 | `Notion에 저장` | `rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover` |
| 저장 중 | `저장 중…` | 위와 같고 `disabled:opacity-50` |
| 저장됨(`notionPageUrl` 있음) | `저장됨` | `bg-primary-soft text-primary-soft-text`, 클릭 시 Notion 페이지를 새 탭으로 열기. 중복 저장 방지 |

## 7. 상태별 화면

- **로그아웃 상태:** 중앙 정렬. 앱 이름(`text-3xl font-semibold text-primary`), 안내 문구(`text-muted`), `로그인`(채움 파랑) / `회원가입`(`border-border bg-surface text-primary`) 버튼 두 개. 모든 페이지가 로그인 필수다.
- **빈 상태(뉴스 없음):** `py-20 text-center text-muted`. 안내 문구 `아직 가져온 뉴스가 없습니다. '뉴스 가져오기'를 눌러 보세요.`
- **필터 결과 없음:** `이 카테고리에 해당하는 뉴스가 없습니다.`
- **로딩:** 가져오는 동안 `뉴스 가져오기` 버튼을 비활성화하고 `가져오는 중…`으로 바꾼다. 카드 자리는 `animate-pulse` 스켈레톤을 쓴다.
- **결과 안내:** 가져오기가 끝나면 `신규 N건, 실패 M건`을 토스트 또는 헤더 아래 배너(`bg-primary-soft text-primary-soft-text rounded-lg px-4 py-2 text-sm`)로 보여 준다.
- **오류:** RSS·Claude·Notion 호출 실패는 앱이 멈추지 않게 하고 사용자에게 보이는 오류 메시지로 알린다. 오류 배너는 파란 계열과 구분되도록 `bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300`를 쓴다.

## 8. 접근성·반응형

- 모든 버튼에 `type="button"`을 지정하고, 아이콘만 있는 버튼에는 `aria-label`을 붙인다.
- 선택된 카테고리 칩에 `aria-pressed="true"`를 지정한다.
- 키보드 포커스가 보이게 한다: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`.
- 본문 글자와 배경의 대비는 WCAG AA(4.5:1) 이상을 유지한다. `muted`는 본문이 아닌 보조 정보에만 쓴다.
- 클릭 영역은 최소 높이 32px 이상(`py-1.5` + `text-sm`), 모바일에서는 헤더 버튼을 `h-10` 이상으로 한다.
- 가로 스크롤이 생기지 않아야 한다. 긴 제목·URL은 `break-words`로 처리한다.

## 9. 컴포넌트 구성 (예정)

| 컴포넌트 | 위치 | 역할 |
|---|---|---|
| `Header` | `src/components/header.tsx` | 앱 이름, 뉴스 가져오기 버튼, `UserButton` |
| `CategoryBar` | `src/components/category-bar.tsx` | 카테고리 칩 목록 + 추가 버튼 |
| `AddCategoryDialog` | `src/components/add-category-dialog.tsx` | 카테고리 이름·설명 입력 |
| `NewsCard` | `src/components/news-card.tsx` | 기사 한 장 표시, Notion 저장 버튼 |
| `NewsGrid` | `src/components/news-grid.tsx` | 카드 그리드·빈 상태·로딩 |

스타일 변경은 먼저 이 문서와 `globals.css`의 토큰을 고치고, 컴포넌트에서는 토큰 클래스만 사용한다.
