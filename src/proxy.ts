import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 페이지는 로그인 모달 화면을 직접 렌더링하므로 통과시키고,
// API 라우트는 비로그인 요청을 401로 차단한다.
export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api")) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
});

export const config = {
  matcher: [
    // Next 내부 파일과 정적 파일은 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 실행
    "/(api)(.*)",
  ],
};
