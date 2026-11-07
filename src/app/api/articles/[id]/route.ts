import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

type Context = { params: Promise<{ id: string }> };

// 뉴스 삭제. 이미 없는 기사도 성공으로 취급한다(멱등).
export async function DELETE(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  try {
    await db.delete(articles).where(eq(articles.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("뉴스 삭제 실패", error);
    return Response.json(
      { error: "뉴스를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
