// 실제 카드와 같은 구조로 만들어 로딩이 끝날 때 화면이 출렁이지 않게 한다.
export function CardSkeleton() {
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
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-24 rounded bg-primary-soft" />
          <div className="h-3 w-16 rounded bg-primary-soft" />
        </div>
        <div className="h-8 w-20 rounded-full bg-primary-soft" />
      </div>
    </div>
  );
}

export function SkeletonCards({ count }: { count: number }) {
  return Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />);
}
