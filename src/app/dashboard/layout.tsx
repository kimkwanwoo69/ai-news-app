import { UserButton } from "@clerk/nextjs";
import { FetchingProvider } from "@/components/fetching-context";
import { FetchNewsButton } from "@/components/fetch-news-button";
import { Footer } from "@/components/footer";

// 헤더를 레이아웃에 두어, 페이지가 오류로 대체되어도 앱 이름과 사용자 메뉴가 유지된다.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FetchingProvider>
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-lg font-bold text-primary">AI 뉴스 수집기</span>
          <div className="flex items-center gap-3">
            <FetchNewsButton />
            <UserButton />
          </div>
        </div>
      </header>
      {children}
      <Footer />
    </FetchingProvider>
  );
}
