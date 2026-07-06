"use client";

/**
 * Server-side pagination footer for `DataTable`, driven by the backend
 * `pagination` envelope (offset/page contract). Uses `total` when the backend
 * provides it (exact page count + range), and falls back to `hasMore` when it
 * doesn't (next-only navigation).
 */

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface DataTablePaginationProps {
  /** Current 1-based page. */
  page: number;
  /** Page size used to compute the displayed range / page count. */
  pageSize: number;
  /** Pagination envelope from the last successful response. */
  pagination: Pagination | null;
  /** Number of rows currently rendered (for the "x–y" range). */
  rowCount: number;
  /** Called with the requested 1-based page. */
  onPageChange: (page: number) => void;
  /** Dims controls while a page change is loading. */
  isFetching?: boolean;
}

export function DataTablePagination({
  page,
  pageSize,
  pagination,
  rowCount,
  onPageChange,
  isFetching = false,
}: DataTablePaginationProps) {
  const total = pagination?.total ?? null;
  const hasMore = pagination?.hasMore ?? false;

  const totalPages =
    total != null && pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : null;

  const start = rowCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = rowCount > 0 ? start + rowCount - 1 : 0;

  const canPrev = page > 1;
  const canNext = totalPages != null ? page < totalPages : hasMore;

  return (
    <div className="flex items-center justify-between border-t border-outline-variant px-3 py-2 text-xs text-on-surface-variant">
      <span className="tabular-nums">
        {total != null ? (
          <>
            {start}–{end} sur {total}
          </>
        ) : (
          <>
            {start}–{end}
          </>
        )}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev || isFetching}
          aria-label="Page précédente"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border border-outline-variant hover:bg-surface-container-high disabled:opacity-40",
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="px-2 tabular-nums">
          {totalPages != null ? (
            <>
              {page} / {totalPages}
            </>
          ) : (
            page
          )}
        </span>
        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext || isFetching}
          aria-label="Page suivante"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border border-outline-variant hover:bg-surface-container-high disabled:opacity-40",
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
