import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { saveArticleToNotion } from "@/lib/notion/save-article";

export const maxDuration = 60;

type Context = { params: Promise<{ id: string }> };

// 기사를 Notion DB에 저장하고 notionPageUrl을 기록한다.
export async function POST(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const [row] = await db
    .select({
      titleKo: articles.titleKo,
      summaryKo: articles.summaryKo,
      url: articles.url,
      publishedAt: articles.publishedAt,
      notionPageUrl: articles.notionPageUrl,
      categoryName: categories.name,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.id, id));

  if (!row) {
    return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
  }
  // 이미 저장된 기사는 다시 만들지 않는다(중복 방지).
  if (row.notionPageUrl) {
    return Response.json({ notionPageUrl: row.notionPageUrl });
  }

  let notionPageUrl: string;
  try {
    notionPageUrl = await saveArticleToNotion({
      title: row.titleKo,
      summary: row.summaryKo,
      categoryName: row.categoryName ?? "기타",
      url: row.url,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    });
  } catch (error) {
    console.error("Notion 저장 실패", error);
    return Response.json(
      { error: "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  try {
    await db
      .update(articles)
      .set({ notionPageUrl })
      .where(and(eq(articles.id, id), isNull(articles.notionPageUrl)));
  } catch (error) {
    console.error("notionPageUrl 기록 실패", error);
    return Response.json(
      { error: "Notion에는 저장됐지만 상태를 기록하지 못했어요." },
      { status: 500 },
    );
  }

  return Response.json({ notionPageUrl });
}
