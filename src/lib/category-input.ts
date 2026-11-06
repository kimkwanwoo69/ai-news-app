// 카테고리 API(추가·수정)가 공유하는 입력 검증과 상수. 서버 전용 의존성이 없어 클라이언트에서도 import할 수 있다.
export const ETC_NAME = "기타";
export const NAME_MAX = 30;
export const DESCRIPTION_MAX = 200;

export type CategoryInput = { name: string; description: string };

export function parseCategoryInput(
  body: unknown,
): CategoryInput | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "잘못된 요청이에요." };
  }
  const { name, description } = body as Record<string, unknown>;

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) return { error: "카테고리 이름을 입력해 주세요." };
  if (trimmedName.length > NAME_MAX) {
    return { error: `이름은 ${NAME_MAX}자 이하로 입력해 주세요.` };
  }

  const trimmedDescription =
    typeof description === "string" ? description.trim() : "";
  if (trimmedDescription.length > DESCRIPTION_MAX) {
    return { error: `설명은 ${DESCRIPTION_MAX}자 이하로 입력해 주세요.` };
  }

  return { name: trimmedName, description: trimmedDescription };
}

// Postgres unique 위반(23505). 드라이버가 cause에 감싸서 던질 수 있어 둘 다 본다.
export function isUniqueViolation(error: unknown): boolean {
  for (let e: unknown = error, i = 0; e && i < 3; i++) {
    if (typeof e === "object" && (e as { code?: unknown }).code === "23505") {
      return true;
    }
    e = (e as { cause?: unknown }).cause;
  }
  return false;
}
