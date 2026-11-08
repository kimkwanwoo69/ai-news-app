import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CardSkeleton } from "@/components/card-skeleton";
import { NewsBoard } from "@/components/news-board";
import { countArticles, listArticles, listCategories } from "@/db/queries";

export const metadata = {
  title: "대시보드 | AI 뉴스 수집기",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}

// 인증·DB 조회는 요청 시점 데이터이므로 Suspense 안에서 수행한다.
async function DashboardContent() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const [articles, categories, total] = await Promise.all([
    listArticles(),
    listCategories(),
    countArticles(),
  ]);

  return (
    <>
      <p className="mb-4 inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary-soft-text">
        총 {total}개의 뉴스
      </p>
      <NewsBoard articles={articles} categories={categories} />
    </>
  );
}

// 실제 카드와 같은 구조로 만들어 로딩이 끝날 때 화면이 출렁이지 않게 한다.
function DashboardSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">뉴스를 불러오는 중…</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="mb-6 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-20 rounded-full bg-primary-soft" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
