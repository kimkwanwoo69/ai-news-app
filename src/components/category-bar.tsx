"use client";

import { useState } from "react";
import type { DashboardCategory } from "@/db/queries";
import { ETC_NAME } from "@/lib/category-input";
import { CategoryDialog } from "./category-dialog";

// 'all' = 전체, 'none' = 카테고리 없음('기타'), number = 카테고리 id
export type Filter = "all" | "none" | number;

const chipBase =
  "rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:py-1.5";

// 열려 있는 모달: 'add' = 추가, 카테고리 = 그 카테고리 편집
type DialogState = null | "add" | DashboardCategory;

export function CategoryBar({
  categories,
  filter,
  onSelect,
}: {
  categories: DashboardCategory[];
  filter: Filter;
  onSelect: (next: Filter) => void;
}) {
  const [dialog, setDialog] = useState<DialogState>(null);

  // '기타'는 항상 카테고리 목록의 맨 뒤. DB에 없으면 '카테고리 없음' 칩으로 대신한다.
  const etc = categories.find((c) => c.name === ETC_NAME);
  const others = categories.filter((c) => c.name !== ETC_NAME);
  const chips: { key: Filter; label: string; category?: DashboardCategory }[] = [
    { key: "all", label: "전체" },
    ...others.map((c) => ({ key: c.id as Filter, label: c.name, category: c })),
    etc
      ? { key: etc.id as Filter, label: etc.name }
      : { key: "none" as Filter, label: ETC_NAME },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const selected = filter === chip.key;
        return (
          <span key={chip.key} className="flex items-center gap-1">
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(chip.key)}
              className={`${chipBase} ${
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {chip.label}
            </button>
            {selected && chip.category && (
              <button
                type="button"
                aria-label={`${chip.label} 카테고리 편집`}
                onClick={() => setDialog(chip.category!)}
                className="flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-8"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            )}
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => setDialog("add")}
        className="rounded-full border border-dashed border-primary/50 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:py-1.5"
      >
        + 카테고리
      </button>

      {dialog && (
        <CategoryDialog
          // 모드가 바뀌면 입력값이 초기화되도록 key를 다르게 준다.
          key={dialog === "add" ? "add" : dialog.id}
          category={dialog === "add" ? null : dialog}
          onClose={() => setDialog(null)}
          onDeleted={(id) => {
            if (filter === id) onSelect("all");
          }}
        />
      )}
    </div>
  );
}
