"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { DashboardCategory } from "@/db/queries";
import { DESCRIPTION_MAX, NAME_MAX } from "@/lib/category-input";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary";

// category가 null이면 추가, 있으면 수정(+삭제) 모드.
export function CategoryDialog({
  category,
  onClose,
  onDeleted,
}: {
  category: DashboardCategory | null;
  onClose: () => void;
  onDeleted?: (id: number) => void;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  async function request(url: string, init: RequestInit) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          res.status === 401
            ? "로그인이 만료됐어요. 새로고침 후 다시 로그인해 주세요."
            : (data.error ?? "요청을 처리하지 못했어요."),
        );
        return false;
      }
      return true;
    } catch {
      setError("네트워크 오류가 발생했어요.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await request(
      category ? `/api/categories/${category.id}` : "/api/categories",
      {
        method: category ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      },
    );
    if (ok) {
      router.refresh();
      onClose();
    }
  }

  async function handleDelete() {
    if (!category) return;
    const ok = await request(`/api/categories/${category.id}`, {
      method: "DELETE",
    });
    if (ok) {
      onDeleted?.(category.id);
      router.refresh();
      onClose();
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // 패널 바깥(배경)을 누르면 닫는다.
        if (e.target === ref.current && !busy) ref.current?.close();
      }}
      aria-labelledby="category-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-5 text-foreground backdrop:bg-black/40"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 id="category-dialog-title" className="text-base font-semibold">
          {category ? "카테고리 편집" : "카테고리 추가"}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category-name" className="text-sm font-medium">
            이름
          </label>
          <input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            required
            autoFocus
            placeholder="예: 로보틱스"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category-description" className="text-sm font-medium">
            설명
          </label>
          <textarea
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={DESCRIPTION_MAX}
            rows={3}
            placeholder="어떤 기사가 들어가는지 적어 주세요"
            className={inputClass}
          />
          <p className="text-xs text-muted">
            AI가 기사를 분류할 때 참고하는 힌트예요.
            {category && " 수정 내용은 이후 수집하는 기사부터 반영돼요."}
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {confirmingDelete && (
          <div className="flex flex-col gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            <p>
              &lsquo;{category?.name}&rsquo; 카테고리를 삭제할까요? 이 카테고리의
              기사는 &lsquo;기타&rsquo;로 표시돼요.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="h-9 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
              >
                {busy ? "삭제 중…" : "삭제"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={busy}
                className="h-9 rounded-full border border-border bg-surface px-4 text-sm text-foreground transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {category && !confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={busy}
              className="h-10 rounded-full px-3 text-sm text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 sm:h-9 dark:text-red-300 dark:hover:bg-red-950"
            >
              삭제
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              disabled={busy}
              className="h-10 rounded-full border border-border bg-surface px-4 text-sm text-foreground transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 sm:h-9"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={busy || !name.trim()}
              className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 sm:h-9"
            >
              {busy && !confirmingDelete ? "저장 중…" : "저장"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
