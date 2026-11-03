# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

`PRD.md` (Korean) is the source of truth for scope, data model, env vars and the implementation order (section 11). Currently only the stock `create-next-app` scaffold exists (Next.js 16, React 19, TypeScript, Tailwind 4, App Router, `src/` dir, alias `@/*`). None of the PRD's other dependencies (Clerk, Drizzle/Neon, `@anthropic-ai/sdk`, `rss-parser`, Notion MCP) are installed yet — add them step by step following the PRD order.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (PRD requires build + typecheck to pass)
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- Typecheck: `npx tsc --noEmit`
- No test runner is configured.

## Next.js version warning

`AGENTS.md` states this Next.js version has breaking changes versus common training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices.

## Architecture (planned, per PRD)

AI News Collector: pulls RSS from TechCrunch AI and The Verge AI on a button click, has Claude translate/summarize/classify each new article into Korean, shows cards with category filter, and saves chosen articles to Notion.

- **Auth:** Clerk protects all pages *and* all API routes (no anonymous access).
- **Data:** Neon Postgres via Drizzle. `categories` (name unique) and `articles` (url unique; `categoryId` FK set null on delete; nullable `notionPageUrl`). Data is shared across all users (no per-user separation).
- **Ingest flow ("뉴스 가져오기"):** read both feeds → take latest N (default 10) per feed → skip URLs already in DB → per new article call Claude with the *current* category list (names + descriptions as hints); anything outside the list becomes '기타' → limited concurrency; one article failing must not abort the rest; report "신규 N건, 실패 M건".
- **Categories:** deleting a category makes its articles uncategorized ('기타'); edits only affect future classification (no reclassification).
- **Notion save:** the server acts as an MCP client of `@notionhq/notion-mcp-server` to create a page in `NOTION_DATABASE_ID` (title, summary, category, source, URL), then stores `notionPageUrl` and the button becomes '저장됨' (prevents duplicates).
- **Secrets** (`CLERK_*`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_TOKEN`, `NOTION_DATABASE_ID`) are server-only; external-call failures (RSS/Claude/Notion) must surface as user-visible errors without crashing the app.
