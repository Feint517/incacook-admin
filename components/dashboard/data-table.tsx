"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  rowKey: (row: T) => string;
  empty?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  onRowClick,
  pageSize = 12,
  rowKey,
  empty,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);

  React.useEffect(() => {
    if (page > 0 && page >= totalPages) setPage(0);
  }, [rows, totalPages, page]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-outline-variant bg-surface-container-low p-12 text-center">
        {empty || (
          <p className="text-sm text-on-surface-variant">Aucune donnée pour cette période</p>
        )}
      </div>
    );
  }

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
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-outline-variant px-3 py-2 text-xs text-on-surface-variant">
          <span>
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, rows.length)} sur {rows.length}
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
      )}
    </div>
  );
}
