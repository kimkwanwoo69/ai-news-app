import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewsBoard } from "@/components/news-board";
import { listArticles, listCategories } from "@/db/queries";

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

  const [articles, categories] = await Promise.all([
    listArticles(),
    listCategories(),
  ]);

  return <NewsBoard articles={articles} categories={categories} />;
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

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="h-6 w-20 rounded-full bg-primary-soft" />
        <div className="h-4 w-24 rounded bg-primary-soft" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-5 w-full rounded bg-primary-soft" />
        <div className="h-5 w-2/3 rounded bg-primary-soft" />
        <div className="h-3 w-1/2 rounded bg-primary-soft" />
        <div className="mt-1 h-3 w-full rounded bg-primary-soft" />
        <div className="h-3 w-full rounded bg-primary-soft" />
        <div className="h-3 w-4/5 rounded bg-primary-soft" />
      </div>
      <div className="mt-auto border-t border-border pt-4">
        <div className="h-4 w-28 rounded bg-primary-soft" />
      </div>
    </div>
  );
}
