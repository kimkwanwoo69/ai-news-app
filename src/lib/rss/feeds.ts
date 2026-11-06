export type FeedSource = { name: string; url: string };

export const FEEDS: FeedSource[] = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];

// 이 시간(ms) 안에 발행된 기사만 수집한다.
export const WINDOW_MS = 24 * 60 * 60 * 1000;
