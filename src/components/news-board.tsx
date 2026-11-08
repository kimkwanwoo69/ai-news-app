"use client";

import { useState, type FormEvent } from "react";
import type { DashboardArticle, DashboardCategory } from "@/db/queries";
import { CategoryBar, type Filter } from "./category-bar";
import { SkeletonCards } from "./card-skeleton";
import { useFetching } from "./fetching-context";
import { NewsCard } from "./news-card";

const PAGE_SIZE = 9;
const EMPTY_SKELETON_COUNT = 6; // 기사가 없을 때 보여 줄 스켈레톤 수
const INSERT_SKELETON_COUNT = 3; // 기존 목록 앞에 끼울 스켈레톤 수

export function NewsBoard({
  articles,
  categories,
}: {
  articles: DashboardArticle[];
  categories: DashboardCategory[];
}) {
  const [filter, setFilterState] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  // draft: 입력 중인 값, query: '검색'을 눌러 적용된 값
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const { fetching } = useFetching();

  // 필터를 바꾸면 1페이지로 돌아간다.
  function setFilter(next: Filter) {
    setFilterState(next);
    setPage(1);
  }

  function applySearch(value: string) {
    setQuery(value.trim());
    setPage(1);
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    applySearch(draft);
  }

  function resetAll() {
    setDraft("");
    applySearch("");
    setFilter("all");
  }

  // 기사가 하나도 없으면 필터 칩은 의미가 없으므로 안내 화면만 보여 준다.
  if (articles.length === 0) {
    if (fetching) {
      return (
        <div role="status" aria-live="polite">
          <span className="sr-only">뉴스를 가져오는 중…</span>
          <div
            aria-hidden="true"
            className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 motion-safe:animate-pulse"
          >
            <SkeletonCards count={EMPTY_SKELETON_COUNT} />
          </div>
        </div>
      );
    }
    return (
      <EmptyState
        title="아직 수집한 뉴스가 없어요"
        description="뉴스를 가져오면 이곳에 카드로 정리돼요."
      />
    );
  }

  // DB에 '기타' 카테고리가 있으면 그 칩이 카테고리 없는 기사도 함께 보여 준다.
  const etc = categories.find((c) => c.name === "기타");

  // 공백으로 나눈 단어를 모두 포함하는 기사만 남긴다(대소문자 무시).
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const visible = articles.filter((a) => {
    if (terms.length > 0) {
      const text = [
        a.titleKo,
        a.titleOriginal,
        a.summaryKo,
        a.author ?? "",
        a.sourceName,
      ]
        .join("\n")
        .toLowerCase();
      if (!terms.every((t) => text.includes(t))) return false;
    }
    if (filter === "all") return true;
    if (filter === "none") return a.categoryId === null;
    if (a.categoryId === filter) return true;
    return filter === etc?.id && a.categoryId === null;
  });

  // 새로 가져오기 등으로 개수가 줄어도 범위를 벗어나지 않게 보정한다.
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  return (
    <>
      <form role="search" onSubmit={submitSearch} className="mb-4 flex gap-2">
        <input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="키워드로 뉴스 검색"
          aria-label="뉴스 검색어"
          className="h-10 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              applySearch("");
            }}
            className="h-10 rounded-full border border-border bg-surface px-4 text-sm text-muted transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            지우기
          </button>
        )}
        <button
          type="submit"
          className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          검색
        </button>
      </form>

      <CategoryBar
        categories={categories}
        filter={filter}
        onSelect={setFilter}
      />

      {visible.length === 0 ? (
        <EmptyState
          title={
            query
              ? "검색 결과가 없어요"
              : "이 카테고리에 해당하는 뉴스가 없어요"
          }
          description={
            query
              ? `"${query}"에 맞는 뉴스를 찾지 못했어요. 다른 키워드로 검색해 보세요.`
              : "다른 카테고리를 고르거나 전체 뉴스를 확인해 보세요."
          }
          action={
            <button
              type="button"
              onClick={resetAll}
              className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              전체 보기
            </button>
          }
        />
      ) : (
        <>
          {fetching && (
            <span role="status" className="sr-only">
              뉴스를 가져오는 중…
            </span>
          )}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {fetching && (
              <div
                aria-hidden="true"
                className="contents motion-safe:animate-pulse"
              >
                <SkeletonCards count={INSERT_SKELETON_COUNT} />
              </div>
            )}
            {visible
              .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              .map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
          </div>
          {totalPages > 1 && (
            <nav
              aria-label="페이지 이동"
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
            >
              <PageButton
                label="이전"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <PageButton
                  key={n}
                  label={String(n)}
                  current={n === currentPage}
                  onClick={() => setPage(n)}
                />
              ))}
              <PageButton
                label="다음"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              />
            </nav>
          )}
        </>
      )}
    </>
  );
}

function PageButton({
  label,
  onClick,
  current,
  disabled,
}: {
  label: string;
  onClick: () => void;
  current?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={current ? "page" : undefined}
      className={`h-10 min-w-10 rounded-full border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 sm:h-8 sm:min-w-8 ${
        current
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface text-muted hover:border-primary hover:text-primary disabled:hover:border-border disabled:hover:text-muted"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          <path d="M4 5h13a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5Z" />
          <path d="M19 9h1a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2" />
          <path d="M8 9h7M8 13h7M8 16h4" />
        </svg>
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-xs text-sm text-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
