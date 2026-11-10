// ui.md 5-3 참고. mt-auto로 뉴스가 적어도 화면 맨 아래에 붙는다.
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-xs text-muted sm:px-6 sm:text-left">
        <p>Copyright 2026 AI뉴스 수집기. Powered by Claude.</p>
      </div>
    </footer>
  );
}
