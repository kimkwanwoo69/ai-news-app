"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";

// 로그인 상태를 브라우저에서 직접 읽어, 모달 로그인 직후 대시보드로 바로 이동한다.
export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return (
      <main
        role="status"
        className="flex flex-1 items-center justify-center text-sm text-muted"
      >
        불러오는 중…
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-primary">
        AI 뉴스 수집기
      </h1>
      <p className="text-muted">서비스를 이용하려면 먼저 로그인해 주세요.</p>
      <div className="flex gap-3">
        <SignInButton mode="modal">
          <button
            type="button"
            className="h-11 rounded-full bg-primary px-6 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            로그인
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            type="button"
            className="h-11 rounded-full border border-border bg-surface px-6 font-medium text-primary transition-colors hover:bg-primary-soft"
          >
            회원가입
          </button>
        </SignUpButton>
      </div>
    </main>
  );
}
