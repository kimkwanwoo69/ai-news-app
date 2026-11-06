import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories } from "./schema";

try {
  process.loadEnvFile(".env.local");
} catch {
  // fall back to variables already present in the environment
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (.env.local)");
}

const db = drizzle(neon(process.env.DATABASE_URL));

const defaults = [
  { name: "모델/제품", description: "새로운 AI 모델, 제품, 기능 출시" },
  { name: "연구 & 논문", description: "논문, 벤치마크, 기술적 연구 성과" },
  { name: "정책, 규제", description: "AI 관련 법, 규제, 정부 정책, 소송" },
  { name: "산업·투자", description: "기업 동향, 투자, 인수합병, 시장" },
  { name: "도구·서비스", description: "개발자 도구, 앱, 서비스 활용 사례" },
  { name: "기타", description: "위 분류에 해당하지 않는 기사" },
];

async function main() {
  const inserted = await db
    .insert(categories)
    .values(defaults)
    .onConflictDoNothing({ target: categories.name })
    .returning({ name: categories.name });

  console.log(`seeded ${inserted.length} new categories`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
