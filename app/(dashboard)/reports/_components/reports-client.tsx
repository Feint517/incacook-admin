"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { useAdminQuery } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateFr } from "@/lib/utils";
import { ReportDrawer } from "./report-drawer";
import {
  REPORT_STATUS_LABEL,
  REPORT_STATUS_VARIANT,
  REPORT_TYPE_LABEL,
  STATUS_FILTERS,
  TYPE_FILTERS,
  type ReportListItem,
  type ReportReason,
  type ReportStatus,
} from "./types";

const PAGE_SIZE = 20;

const ALL = "all";

export function ReportsClient() {
  const [status, setStatus] = useState<ReportStatus | typeof ALL>(ALL);
  const [type, setType] = useState<ReportReason | typeof ALL>(ALL);
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<ReportListItem | null>(null);

  const { data, pagination, isLoading, isError, error, refetch } =
    useAdminQuery<ReportListItem[]>({
      path: "/admin/reports",
      params: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        extra: {
          ...(status !== ALL ? { status } : {}),
          ...(type !== ALL ? { type } : {}),
        },
      },
    });

  const rows = data ?? [];

  function changeStatusFilter(next: ReportStatus | typeof ALL) {
    setStatus(next);
    setPage(1);
  }

  function changeTypeFilter(next: ReportReason | typeof ALL) {
    setType(next);
    setPage(1);
  }

  const cols: Column<ReportListItem>[] = [
    {
      key: "createdAt",
      header: "Date",
      width: "120px",
      cell: (r) => (
        <span className="text-[12px] text-on-surface-variant">
          {formatDateFr(r.createdAt)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "160px",
      cell: (r) => (
        <Badge variant={r.type === "MAUVAISE_HYGIENE" ? "error" : "warning"}>
          {REPORT_TYPE_LABEL[r.type] ?? r.type}
        </Badge>
      ),
    },
    {
      key: "entity",
      header: "Entité signalée",
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-on-surface">
            {r.listing?.name ?? r.seller?.name ?? r.targetId}
          </div>
          <div className="text-[10.5px] uppercase tracking-wider text-on-surface-variant">
            {r.targetType === "LISTING" ? "Annonce" : "Vendeur"}
          </div>
        </div>
      ),
    },
    {
      key: "reporter",
      header: "Auteur",
      cell: (r) => (
        <span className="truncate text-[12px] text-on-surface-variant">
          {r.reporter?.name || r.reporter?.email || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      width: "120px",
      cell: (r) => (
        <Badge variant={REPORT_STATUS_VARIANT[r.status]}>
          {REPORT_STATUS_LABEL[r.status] ?? r.status}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <div className="frost mb-4 flex flex-wrap items-center gap-2 rounded-md p-3">
        <div className="mr-auto inline-flex items-center gap-2 text-[13px] text-on-surface-variant">
          <Flag className="h-4 w-4" />
          File de modération
        </div>
        <Select
          value={status}
          onValueChange={(v) => changeStatusFilter(v as ReportStatus | typeof ALL)}
        >
          <SelectTrigger className="h-8 w-[150px] text-xs" aria-label="Filtrer par statut">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous statuts</SelectItem>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={type}
          onValueChange={(v) => changeTypeFilter(v as ReportReason | typeof ALL)}
        >
          <SelectTrigger className="h-8 w-[170px] text-xs" aria-label="Filtrer par type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous types</SelectItem>
            {TYPE_FILTERS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(r) => r.id}
        onRowClick={(r) => setActive(r)}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel="Aucun signalement pour ces filtres."
        pageSize={PAGE_SIZE}
        serverPagination={{
          pagination,
          page,
          onPageChange: setPage,
          pageSize: PAGE_SIZE,
          isFetching: isLoading,
        }}
      />

      <ReportDrawer
        report={active}
        onClose={() => setActive(null)}
        onUpdated={(next) => {
          setActive((prev) => (prev ? { ...prev, status: next } : prev));
          refetch();
        }}
      />
    </>
  );
}
