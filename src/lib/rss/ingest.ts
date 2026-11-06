import { db } from "@/db";
import { articles } from "@/db/schema";
import { fetchRecentArticles } from "./fetch-feeds";

export type IngestResult = {
  added: number;
  skipped: number;
  failedFeeds: string[];
};

export async function ingestNews(): Promise<IngestResult> {
  const { articles: items, failedFeeds } = await fetchRecentArticles();

  let added = 0;
  if (items.length > 0) {
    // url unique 제약으로 이미 저장된 기사는 건너뛴다.
    const inserted = await db
      .insert(articles)
      .values(items)
      .onConflictDoNothing({ target: articles.url })
      .returning({ id: articles.id });
    added = inserted.length;
  }

  return { added, skipped: items.length - added, failedFeeds };
}
