"use client";

export default function DashboardError({ retry }: { retry: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
        뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="h-10 rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        다시 시도
      </button>
    </main>
  );
}
