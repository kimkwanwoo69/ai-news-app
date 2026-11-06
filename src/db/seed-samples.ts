import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { articles, categories } from "./schema";

try {
  process.loadEnvFile(".env.local");
} catch {
  // fall back to variables already present in the environment
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (.env.local)");
}

const db = drizzle(neon(process.env.DATABASE_URL));

// 화면 확인용 예제 기사. 실제 기사가 아니며 URL(example.com/sample/N)로 중복 삽입을 막는다.
const samples = [
  {
    n: 1,
    sourceName: "TechCrunch AI (샘플)",
    category: "모델/제품",
    titleOriginal: "New multimodal model tops coding benchmarks",
    titleKo: "새로운 멀티모달 모델, 코딩 벤치마크에서 최고 성능 기록",
    summaryKo:
      "한 스타트업이 공개한 멀티모달 모델이 주요 코딩 벤치마크에서 기존 최고 기록을 넘어섰다. 이미지와 코드를 함께 이해하는 능력이 강점으로 꼽힌다.",
    author: "Jane Doe",
    publishedAt: "2026-11-05T09:00:00Z",
  },
  {
    n: 2,
    sourceName: "The Verge AI (샘플)",
    category: "도구·서비스",
    titleOriginal: "Major portal expands AI search summaries",
    titleKo: "대형 포털, AI 검색 요약 기능을 전면 확대",
    summaryKo:
      "검색 결과 상단에 AI 요약을 표시하는 기능이 전 지역으로 확대된다. 출처 표기 방식과 퍼블리셔 트래픽 영향이 쟁점이 되고 있다.",
    author: null,
    publishedAt: "2026-11-04T14:30:00Z",
    notionPageUrl: "https://www.notion.so/",
  },
  {
    n: 3,
    sourceName: "TechCrunch AI (샘플)",
    category: "산업·투자",
    titleOriginal: "AI chip startup raises large funding round",
    titleKo: "AI 반도체 스타트업, 대규모 투자 유치",
    summaryKo:
      "추론 전용 칩을 개발하는 스타트업이 시리즈 B 투자를 유치했다. 데이터센터 전력 효율을 앞세워 시장 진입을 노린다.",
    author: "John Smith",
    publishedAt: "2026-11-04T08:10:00Z",
  },
  {
    n: 4,
    sourceName: "The Verge AI (샘플)",
    category: "정책·규제",
    titleOriginal: "Lawmakers advance bill on AI-generated content labels",
    titleKo: "의회, AI 생성 콘텐츠 표시 의무화 법안 진전",
    summaryKo:
      "AI로 만든 이미지와 영상에 출처 표시를 의무화하는 법안이 위원회를 통과했다. 위반 시 과징금을 부과하는 내용이 포함되어 업계의 우려가 나온다.",
    author: "Alex Kim",
    publishedAt: "2026-11-03T17:45:00Z",
  },
  {
    n: 5,
    sourceName: "TechCrunch AI (샘플)",
    category: "연구",
    titleOriginal: "Researchers cut training cost with sparse attention",
    titleKo: "연구진, 희소 어텐션으로 학습 비용 대폭 절감",
    summaryKo:
      "새로운 희소 어텐션 기법이 긴 문맥 모델의 학습 비용을 절반 가까이 줄였다고 연구진이 밝혔다. 성능 저하는 거의 없었다는 설명이다.",
    author: "Maria Lopez",
    publishedAt: "2026-11-02T11:20:00Z",
  },
  {
    n: 6,
    sourceName: "The Verge AI (샘플)",
    category: "도구·서비스",
    titleOriginal: "A coding assistant now reviews pull requests automatically",
    titleKo: "코딩 어시스턴트, 풀 리퀘스트 자동 리뷰 기능 추가",
    summaryKo:
      "개발자 도구에 풀 리퀘스트를 자동으로 검토하고 수정 제안을 남기는 기능이 추가됐다. 팀별 코드 규칙을 학습시켜 쓸 수 있다.",
    author: null,
    publishedAt: null, // 발행일 없는 기사 (수집 시각으로 정렬)
  },
  {
    n: 7,
    sourceName: "TechCrunch AI (샘플)",
    category: null, // 카테고리 없음 → '기타'
    titleOriginal: "Smart glasses maker teases next-generation device",
    titleKo: "스마트 안경 업체, 차세대 기기 예고",
    summaryKo:
      "스마트 안경 제조사가 음성 비서와 실시간 번역을 강화한 차세대 기기를 예고했다. 정확한 출시 일정과 가격은 공개되지 않았다.",
    author: "Chris Park",
    publishedAt: "2026-11-01T06:00:00Z",
  },
];

async function main() {
  const rows = await db.select().from(categories);
  const idByName = new Map(rows.map((c) => [c.name, c.id]));

  const values = samples.map(({ n, category, ...rest }) => ({
    ...rest,
    url: `https://example.com/sample/${n}`,
    categoryId: category ? (idByName.get(category) ?? null) : null,
    publishedAt: rest.publishedAt ? new Date(rest.publishedAt) : null,
    notionPageUrl: "notionPageUrl" in rest ? rest.notionPageUrl : null,
  }));

  const inserted = await db
    .insert(articles)
    .values(values)
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  console.log(`inserted ${inserted.length} sample articles`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
