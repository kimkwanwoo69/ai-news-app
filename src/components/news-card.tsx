import type { DashboardArticle } from "@/db/queries";

// 서버/클라이언트 렌더 결과가 같도록 시간대를 고정한다.
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function NewsCard({ article }: { article: DashboardArticle }) {
  const date = article.publishedAt
    ? dateFormatter.format(new Date(article.publishedAt))
    : null;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-text">
          {article.categoryName ?? "기타"}
        </span>
        <span className="truncate text-xs text-muted">{article.sourceName}</span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="break-words text-lg font-semibold leading-snug">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {article.titleKo}
          </a>
        </h2>
        <p className="line-clamp-1 break-words text-xs text-muted">
          {article.titleOriginal}
        </p>
        <p className="line-clamp-4 break-words text-sm leading-relaxed text-foreground/80">
          {article.summaryKo}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="min-w-0 text-xs text-muted">
          {article.author && (
            <span className="block truncate">{article.author}</span>
          )}
          {date && <time dateTime={article.publishedAt!}>{date}</time>}
        </div>

        {article.notionPageUrl && (
          <a
            href={article.notionPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-medium text-primary-soft-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            저장됨
          </a>
        )}
      </div>
    </article>
  );
}
