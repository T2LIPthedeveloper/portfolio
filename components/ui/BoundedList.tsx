"use client";

import { cn } from "@/lib/utils";

interface BoundedListProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T, index: number) => string;
  className?: string;
  /** Visible rows at base breakpoint (mobile) */
  rows?: 4 | 5;
}

export function BoundedList<T>({
  title,
  items,
  renderItem,
  getKey,
  className,
  rows = 4,
}: BoundedListProps<T>) {
  const overflow = items.length > rows;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col rounded-xl border border-border bg-surface p-4",
        className
      )}
    >
      <div className="flex shrink-0 items-baseline justify-between gap-2">
        <h2 className="text-base font-medium text-text-primary">{title}</h2>
        {overflow && (
          <span className="font-mono text-xs text-text-muted">{items.length} total</span>
        )}
      </div>
      <div
        style={{ "--list-row": "3.25rem" } as React.CSSProperties}
        className={cn(
          "thin-scrollbar mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto",
          rows === 4
            ? "max-h-[calc(var(--list-row)*4)] sm:max-h-[calc(var(--list-row)*5)]"
            : "max-h-[calc(var(--list-row)*5)]"
        )}
      >
        {items.map((item, index) => (
          <div key={getKey(item, index)}>{renderItem(item, index)}</div>
        ))}
      </div>
    </div>
  );
}
