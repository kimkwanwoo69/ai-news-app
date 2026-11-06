import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { articles, categories } from "./schema";

// Server-only. 날짜는 직렬화하기 쉽도록 ISO 문자열로 변환해 반환한다.
export type DashboardArticle = {
  id: number;
  sourceName: string;
  url: string;
  titleKo: string;
  titleOriginal: string;
  summaryKo: string;
  author: string | null;
  categoryId: number | null; // null → '기타'
  categoryName: string | null;
  publishedAt: string | null;
  notionPageUrl: string | null;
};

export type DashboardCategory = {
  id: number;
  name: string;
};

// 최신순: 발행일이 없는 기사는 수집 시각으로 대신 정렬한다.
export async function listArticles(): Promise<DashboardArticle[]> {
  const rows = await db
    .select({
      id: articles.id,
      sourceName: articles.sourceName,
      url: articles.url,
      titleKo: articles.titleKo,
      titleOriginal: articles.titleOriginal,
      summaryKo: articles.summaryKo,
      author: articles.author,
      categoryId: articles.categoryId,
      categoryName: categories.name,
      publishedAt: articles.publishedAt,
      notionPageUrl: articles.notionPageUrl,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(
      desc(sql`coalesce(${articles.publishedAt}, ${articles.createdAt})`),
      desc(articles.id),
    );

  return rows.map((row) => ({
    ...row,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
  }));
}

export async function listCategories(): Promise<DashboardCategory[]> {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.id));
}
