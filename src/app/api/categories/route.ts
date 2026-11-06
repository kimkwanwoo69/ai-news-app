import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { isUniqueViolation, parseCategoryInput } from "@/lib/category-input";

// 카테고리 추가
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = parseCategoryInput(await request.json().catch(() => null));
  if ("error" in input) {
    return Response.json({ error: input.error }, { status: 400 });
  }

  try {
    const [created] = await db.insert(categories).values(input).returning();
    return Response.json(created, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return Response.json(
        { error: "같은 이름의 카테고리가 이미 있어요." },
        { status: 409 },
      );
    }
    console.error("카테고리 추가 실패", error);
    return Response.json(
      { error: "카테고리를 추가하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
