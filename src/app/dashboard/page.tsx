import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { NewsBoard } from "@/components/news-board";
import { listArticles, listCategories } from "@/db/queries";

export const metadata = {
  title: "대시보드 | AI 뉴스 수집기",
};

export default function DashboardPage() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <span className="text-lg font-bold text-primary">AI 뉴스 수집기</span>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </>
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

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="뉴스를 불러오는 중">
      <div className="mb-6 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-full bg-primary-soft"
          />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
