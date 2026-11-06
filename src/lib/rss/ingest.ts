import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, type NewArticle } from "@/db/schema";
import { enrichArticle, FALLBACK_CATEGORY } from "@/lib/ai/enrich";
import { fetchRecentArticles } from "./fetch-feeds";

export type IngestResult = {
  added: number;
  skipped: number;
  failed: number;
  failedFeeds: string[];
};

// Claude 동시 호출 수. 속도 제한과 maxDuration 사이의 균형.
const CONCURRENCY = 4;
const MAX_EXCERPT_CHARS = 2000;

// 최대 limit개씩 동시에 처리하되, 결과는 입력 순서를 유지한다.
async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const i = next++;
        try {
          results[i] = { status: "fulfilled", value: await fn(items[i]) };
        } catch (reason) {
          results[i] = { status: "rejected", reason };
        }
      }
    },
  );
  await Promise.all(workers);
  return results;
}

export async function ingestNews(): Promise<IngestResult> {
  const { articles: items, failedFeeds } = await fetchRecentArticles();

  // 이미 저장된 URL은 Claude를 부르기 전에 제외해 비용을 아낀다.
  const existing =
    items.length > 0
      ? await db
          .select({ url: articles.url })
          .from(articles)
          .where(
            inArray(
              articles.url,
              items.map((a) => a.url),
            ),
          )
      : [];
  const existingUrls = new Set(existing.map((r) => r.url));
  const fresh = items.filter((a) => !existingUrls.has(a.url));

  if (fresh.length === 0) {
    return { added: 0, skipped: items.length, failed: 0, failedFeeds };
  }

  // 분류에는 호출 시점의 최신 카테고리 목록을 쓴다.
  const categoryRows = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
    })
    .from(categories)
    .orderBy(categories.id);
  const categoryIdByName = new Map(categoryRows.map((c) => [c.name, c.id]));

  const settled = await mapWithLimit(fresh, CONCURRENCY, async (item) => {
    const enriched = await enrichArticle(
      {
        titleOriginal: item.titleOriginal,
        excerpt: item.summaryKo.slice(0, MAX_EXCERPT_CHARS),
        sourceName: item.sourceName,
      },
      categoryRows,
    );
    const row: NewArticle = {
      ...item,
      titleKo: enriched.titleKo,
      summaryKo: enriched.summaryKo,
      // '기타'이거나 목록에 없으면 null(미분류 = 기타)
      categoryId:
        enriched.categoryName === FALLBACK_CATEGORY
          ? null
          : (categoryIdByName.get(enriched.categoryName) ?? null),
    };
    return row;
  });

  const rows: NewArticle[] = [];
  let failed = 0;
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") rows.push(r.value);
    else {
      failed++;
      console.error(`번역/분류 실패: ${fresh[i].url}`, r.reason);
    }
  });

  let added = 0;
  if (rows.length > 0) {
    // 동시 실행된 다른 요청과 겹쳐도 url unique 제약으로 중복 저장되지 않는다.
    const inserted = await db
      .insert(articles)
      .values(rows)
      .onConflictDoNothing({ target: articles.url })
      .returning({ id: articles.id });
    added = inserted.length;
  }

  return {
    added,
    skipped: items.length - fresh.length,
    failed,
    failedFeeds,
  };
}
