import Anthropic from "@anthropic-ai/sdk";

// Server-only. ANTHROPIC_API_KEY 환경변수를 SDK가 직접 읽는다.
const client = new Anthropic();

const MODEL = "claude-haiku-5-5";
export const FALLBACK_CATEGORY = "기타";

export type CategoryHint = { name: string; description: string };

export type EnrichInput = {
  titleOriginal: string;
  excerpt: string;
  sourceName: string;
};

export type EnrichOutput = {
  titleKo: string;
  summaryKo: string;
  // 목록에 없는 값은 FALLBACK_CATEGORY로 보정된 상태로 반환한다.
  categoryName: string;
};

const SYSTEM_PROMPT = `당신은 영어 AI 뉴스를 한국어 독자에게 전달하는 편집자입니다.
기사의 제목과 본문 발췌를 받아 다음을 수행하세요.
- titleKo: 제목을 자연스러운 한국어로 번역합니다. 고유명사(회사·제품명)는 원문 표기를 유지해도 됩니다.
- summaryKo: 핵심만 2~3문장의 한국어로 요약합니다. 발췌에 없는 내용은 지어내지 않습니다.
- category: 주어진 카테고리 목록 중 가장 알맞은 하나를 고릅니다. 어디에도 맞지 않으면 "${FALLBACK_CATEGORY}"를 고릅니다.`;

function buildSchema(categoryNames: string[]) {
  return {
    type: "object",
    properties: {
      titleKo: { type: "string" },
      summaryKo: { type: "string" },
      category: { type: "string", enum: categoryNames },
    },
    required: ["titleKo", "summaryKo", "category"],
    additionalProperties: false,
  } as const;
}

// 기사 1건을 번역·요약·분류한다. 실패하면 예외를 던지므로 호출 측에서 처리한다.
export async function enrichArticle(
  input: EnrichInput,
  categories: CategoryHint[],
): Promise<EnrichOutput> {
  const names = [
    ...new Set(categories.map((c) => c.name).filter((n) => n !== FALLBACK_CATEGORY)),
    FALLBACK_CATEGORY,
  ];
  const categoryList = categories
    .filter((c) => c.name !== FALLBACK_CATEGORY)
    .map((c) => `- ${c.name}${c.description ? `: ${c.description}` : ""}`)
    .join("\n");

  const response = await client.messages.create({
    model: MODEL,
    // 적응형 사고 토큰도 max_tokens에 포함되므로 여유 있게 잡는다.
    max_tokens: 4096,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: buildSchema(names) },
    },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `출처: ${input.sourceName}
제목: ${input.titleOriginal}
본문 발췌: ${input.excerpt}

카테고리 목록:
${categoryList || "(없음)"}
- ${FALLBACK_CATEGORY}: 위 항목에 해당하지 않는 기사`,
      },
    ],
  });

  if (response.stop_reason !== "end_turn") {
    throw new Error(`Claude 응답이 완료되지 않았어요 (${response.stop_reason})`);
  }

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("Claude 응답에 텍스트가 없어요");

  const parsed = JSON.parse(text.text) as {
    titleKo?: unknown;
    summaryKo?: unknown;
    category?: unknown;
  };
  const titleKo = typeof parsed.titleKo === "string" ? parsed.titleKo.trim() : "";
  const summaryKo =
    typeof parsed.summaryKo === "string" ? parsed.summaryKo.trim() : "";
  if (!titleKo || !summaryKo) throw new Error("Claude 응답이 비어 있어요");

  const categoryName =
    typeof parsed.category === "string" && names.includes(parsed.category)
      ? parsed.category
      : FALLBACK_CATEGORY;

  return { titleKo, summaryKo, categoryName };
}
