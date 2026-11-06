import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import {
  ETC_NAME,
  isUniqueViolation,
  parseCategoryInput,
} from "@/lib/category-input";

type Context = { params: Promise<{ id: string }> };

// 대상 카테고리를 찾고, 없거나 '기타'(보호 대상)면 응답을 돌려준다.
async function loadEditable(context: Context) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return { response: Response.json({ error: "잘못된 요청이에요." }, { status: 400 }) };
  }

  const [row] = await db.select().from(categories).where(eq(categories.id, id));
  if (!row) {
    return {
      response: Response.json(
        { error: "카테고리를 찾을 수 없어요." },
        { status: 404 },
      ),
    };
  }
  if (row.name === ETC_NAME) {
    return {
      response: Response.json(
        { error: "'기타'는 수정하거나 삭제할 수 없어요." },
        { status: 400 },
      ),
    };
  }
  return { row };
}

// 카테고리 이름·설명 수정. 이미 저장된 기사는 다시 분류하지 않는다.
export async function PATCH(request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = parseCategoryInput(await request.json().catch(() => null));
  if ("error" in input) {
    return Response.json({ error: input.error }, { status: 400 });
  }

  const target = await loadEditable(context);
  if ("response" in target) return target.response;

  try {
    const [updated] = await db
      .update(categories)
      .set(input)
      .where(eq(categories.id, target.row.id))
      .returning();
    return Response.json(updated);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return Response.json(
        { error: "같은 이름의 카테고리가 이미 있어요." },
        { status: 409 },
      );
    }
    console.error("카테고리 수정 실패", error);
    return Response.json(
      { error: "카테고리를 수정하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}

// 카테고리 삭제. FK(onDelete: set null)로 해당 기사는 '기타'가 된다.
export async function DELETE(_request: Request, context: Context) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const target = await loadEditable(context);
  if ("response" in target) return target.response;

  try {
    await db.delete(categories).where(eq(categories.id, target.row.id));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("카테고리 삭제 실패", error);
    return Response.json(
      { error: "카테고리를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
