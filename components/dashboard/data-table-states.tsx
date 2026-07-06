"use client";

/**
 * Standardized list-state presentations for `DataTable`: a loading skeleton,
 * an empty state, and an error state. Kept as small building blocks so pages
 * get a consistent look without each re-inventing one.
 */

import * as React from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import type { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Column } from "./data-table";

const CARD_CLASS =
  "flex flex-col items-center justify-center rounded-md border border-outline-variant bg-surface-container-low p-12 text-center";

/**
 * Skeleton that mirrors the table chrome (header + shimmer rows) so the layout
 * doesn't jump when real data arrives.
 */
export function DataTableSkeleton<T>({
  columns,
  rows = 8,
}: {
  columns: Column<T>[];
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-outline-variant bg-surface-container-low">
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
            {Array.from({ length: rows }).map((_, r) => (
              <tr
                key={r}
                className="border-b border-outline-variant/60 last:border-0"
              >
                {columns.map((c) => (
                  <td key={c.key} className="h-12 px-3">
                    <div
                      className={cn(
                        "h-3.5 animate-pulse rounded bg-surface-container-high",
                        c.align === "right" && "ml-auto",
                        c.align === "center" && "mx-auto",
                        // Vary widths a touch so it reads as content, not bars.
                        r % 3 === 0 ? "w-3/4" : r % 3 === 1 ? "w-1/2" : "w-2/3",
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Empty result state. `label` overrides the default copy. */
export function DataTableEmpty({ label }: { label?: React.ReactNode }) {
  return (
    <div className={CARD_CLASS}>
      <Inbox className="mb-3 h-8 w-8 text-on-surface-variant" aria-hidden />
      {typeof label === "string" || label == null ? (
        <p className="text-sm text-on-surface-variant">
          {label ?? "Aucune donnée pour cette période"}
        </p>
      ) : (
        label
      )}
    </div>
  );
}

/**
 * Error state. Surfaces the `ApiError` message and, when present, the
 * `correlationId` so it can be quoted in a bug report. Offers a retry when
 * `onRetry` is wired.
 */
export function DataTableError({
  error,
  onRetry,
}: {
  error: ApiError | null;
  onRetry?: () => void;
}) {
  const message = error?.message || "Une erreur est survenue lors du chargement.";
  const correlationId = error?.correlationId ?? null;

  return (
    <div
      className={cn(CARD_CLASS, "border-error/40 bg-error/5")}
      role="alert"
    >
      <AlertTriangle className="mb-3 h-8 w-8 text-error" aria-hidden />
      <p className="text-sm font-medium text-on-surface">{message}</p>
      {correlationId && (
        <p className="mt-1 text-xs text-on-surface-variant">
          Réf. : <span className="font-mono tabular-nums">{correlationId}</span>
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Réessayer
        </button>
      )}
    </div>
  );
}
