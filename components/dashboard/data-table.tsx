"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiError, Pagination } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  DataTableEmpty,
  DataTableError,
  DataTableSkeleton,
} from "./data-table-states";
import { DataTablePagination } from "./data-table-pagination";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
}

/**
 * Opt-in server-side pagination, driven by the `pagination` envelope returned
 * from `useAdminQuery`. When provided, the table renders every row it's given
 * (no client-side slicing) and shows envelope-driven prev/next + page/total
 * controls. When omitted, the table keeps its original client-side paging.
 */
export interface ServerPagination {
  /** Pagination envelope from the last successful response. */
  pagination: Pagination | null;
  /** Current 1-based page. */
  page: number;
  /** Called with the requested 1-based page. */
  onPageChange: (page: number) => void;
  /** Page size (defaults to the table's `pageSize`). */
  pageSize?: number;
  /** Dims controls while the next page loads. */
  isFetching?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  rowKey: (row: T) => string;
  /** Custom empty content. Prefer `emptyLabel` for a simple message. */
  empty?: React.ReactNode;

  // --- List-state props (all optional; additive) -----------------------------
  /** Renders a skeleton in place of the table while the first page loads. */
  isLoading?: boolean;
  /** Renders the error state instead of the table. */
  isError?: boolean;
  /** `ApiError` surfaced in the error state (message + correlationId). */
  error?: ApiError | null;
  /** Simple empty-state message (overridden by `empty` if both are set). */
  emptyLabel?: React.ReactNode;
  /** Retry handler shown in the error state (wire to `refetch`). */
  onRetry?: () => void;
  /** Enables server-driven pagination instead of client-side slicing. */
  serverPagination?: ServerPagination;
}

export function DataTable<T>({
  columns,
  rows,
  onRowClick,
  pageSize = 12,
  rowKey,
  empty,
  isLoading = false,
  isError = false,
  error = null,
  emptyLabel,
  onRetry,
  serverPagination,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0);
  const isServer = serverPagination != null;

  // Client-side paging is only used when server pagination isn't wired.
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  React.useEffect(() => {
    if (!isServer && page > 0 && page >= totalPages) setPage(0);
  }, [rows, totalPages, page, isServer]);

  // Error takes precedence, then the first-load skeleton, then empty.
  if (isError) {
    return <DataTableError error={error} onRetry={onRetry} />;
  }

  if (isLoading && rows.length === 0) {
    return <DataTableSkeleton columns={columns} />;
  }

  if (rows.length === 0) {
    // Preserve the original `empty` node API; `emptyLabel` is the simple path.
    return empty ? (
      <div className="flex flex-col items-center justify-center rounded-md border border-outline-variant bg-surface-container-low p-12 text-center">
        {empty}
      </div>
    ) : (
      <DataTableEmpty label={emptyLabel} />
    );
  }

  const pageRows = isServer
    ? rows
    : rows.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-outline-variant bg-surface-container-low",
        // Subtle dim on the whole table while a background refetch runs.
        isLoading && isServer && "opacity-60 transition-opacity",
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="frost border-b border-outline-variant bg-surface-container-high">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "h-9 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.align !== "right" && c.align !== "center" && "text-left",
                  )}
                  style={{ width: c.width }}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx) => (
              <tr
                key={rowKey(row)}
                className={cn(
                  "border-b border-outline-variant/60 last:border-0 transition-colors",
                  idx % 2 === 1 && "bg-surface-container-low",
                  onRowClick &&
                    "cursor-pointer hover:bg-surface-container-high",
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "h-12 px-3 text-on-surface",
                      c.align === "right" && "text-right tabular-nums",
                      c.align === "center" && "text-center",
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isServer ? (
        <DataTablePagination
          page={serverPagination.page}
          pageSize={serverPagination.pageSize ?? pageSize}
          pagination={serverPagination.pagination}
          rowCount={pageRows.length}
          onPageChange={serverPagination.onPageChange}
          isFetching={serverPagination.isFetching ?? isLoading}
        />
      ) : (
        totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-outline-variant px-3 py-2 text-xs text-on-surface-variant">
            <span>
              {page * pageSize + 1}–
              {Math.min((page + 1) * pageSize, rows.length)} sur {rows.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-outline-variant disabled:opacity-40 hover:bg-surface-container-high"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-outline-variant disabled:opacity-40 hover:bg-surface-container-high"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
