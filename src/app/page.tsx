"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

// 로그인 상태를 브라우저에서 직접 읽어, 모달 로그인 직후 화면이 즉시 바뀌도록 한다.
export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <main className="flex flex-1" />;
  }

  if (!isSignedIn) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight">
          AI News Collector
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          서비스를 이용하려면 먼저 로그인해 주세요.
        </p>
        <div className="flex gap-3">
          <SignInButton mode="modal">
            <button className="h-11 rounded-full bg-foreground px-6 font-medium text-background transition-opacity hover:opacity-80">
              로그인
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="h-11 rounded-full border border-black/10 px-6 font-medium transition-colors hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10">
              회원가입
            </button>
          </SignUpButton>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/15">
        <span className="font-semibold">AI News Collector</span>
        <UserButton />
      </header>
      <main className="flex flex-1 items-center justify-center text-zinc-600 dark:text-zinc-400">
        로그인되었습니다.
      </main>
    </>
  );
}
