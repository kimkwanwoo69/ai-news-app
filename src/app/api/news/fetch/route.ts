import { auth } from "@clerk/nextjs/server";
import { ingestNews } from "@/lib/rss/ingest";

export const maxDuration = 60;

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await ingestNews();
    return Response.json(result);
  } catch (error) {
    console.error("뉴스 가져오기 실패", error);
    return Response.json(
      { error: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
