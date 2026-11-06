import Parser from "rss-parser";
import type { NewArticle } from "@/db/schema";
import { FEEDS, PER_FEED_LIMIT, WINDOW_MS } from "./feeds";

const parser = new Parser({ timeout: 10_000 });

export type FetchResult = {
  articles: NewArticle[];
  failedFeeds: string[];
};

// 모든 피드를 읽어 최근 24시간 기사만 articles 형태로 변환한다.
// 피드 하나가 실패해도 나머지는 계속 처리한다.
export async function fetchRecentArticles(
  now: number = Date.now(),
): Promise<FetchResult> {
  const since = now - WINDOW_MS;

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      const articles: NewArticle[] = [];

      for (const item of parsed.items) {
        const url = item.link?.trim();
        const title = item.title?.trim();
        if (!url || !title) continue;

        const dateStr = item.isoDate ?? item.pubDate;
        const publishedAt = dateStr ? new Date(dateStr) : null;
        if (
          !publishedAt ||
          Number.isNaN(publishedAt.getTime()) ||
          publishedAt.getTime() < since
        ) {
          continue;
        }

        // 번역·요약·분류는 ingest 단계에서 Claude가 덮어쓴다. 지금은 원문을 임시로 채운다.
        articles.push({
          sourceName: feed.name,
          url,
          titleOriginal: title,
          titleKo: title,
          summaryKo: item.contentSnippet?.trim() || title,
          author: item.creator?.trim() || null,
          publishedAt,
        });
      }
      // 최신순으로 정렬해 피드당 상한만큼만 남긴다.
      articles.sort(
        (a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime(),
      );
      return articles.slice(0, PER_FEED_LIMIT);
    }),
  );

  const articles: NewArticle[] = [];
  const failedFeeds: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") articles.push(...r.value);
    else {
      console.error(`RSS 실패: ${FEEDS[i].name}`, r.reason);
      failedFeeds.push(FEEDS[i].name);
    }
  });

  return { articles, failedFeeds };
}
