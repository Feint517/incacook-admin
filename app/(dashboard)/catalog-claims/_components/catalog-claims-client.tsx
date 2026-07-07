"use client";

import { useState } from "react";
import { PackageOpen } from "lucide-react";
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
import { formatDateTimeFr } from "@/lib/utils";
import { CatalogClaimDrawer } from "./catalog-claim-drawer";
import {
  STATUS_FILTERS,
  STATUS_FILTER_ALL,
  statusLabel,
  typeLabel,
  STATUS_VARIANT,
  type CatalogClaim,
  type CatalogClaimStatus,
} from "./types";

const PAGE_SIZE = 20;

export function CatalogClaimsClient() {
  const [status, setStatus] = useState(STATUS_FILTER_ALL);
  const [activeId, setActiveId] = useState<string | null>(null);

  // `GET /v1/admin/catalog-claims` returns a bare array (no pagination
  // envelope), so paging is client-side via the DataTable. The optional
  // `status` filter is forwarded as a query param (omitted for the "all"
  // sentinel).
  const { data, isLoading, isError, error, refetch } = useAdminQuery<
    CatalogClaim[]
  >({
    path: "/admin/catalog-claims",
    params: {
      extra: status !== STATUS_FILTER_ALL ? { status } : undefined,
    },
  });

  const rows = data ?? [];

  const cols: Column<CatalogClaim>[] = [
    {
      key: "catalogOrderId",
      header: "Commande",
      cell: (c) => (
        <div className="min-w-0">
          <div className="truncate font-mono text-[12px] text-on-surface">
            {c.catalogOrderId}
          </div>
          <div className="truncate text-[11px] text-on-surface-variant">
            {typeLabel(c.type)}
          </div>
        </div>
      ),
    },
    {
      key: "sellerId",
      header: "Vendeur",
      width: "220px",
      cell: (c) => (
        <div className="min-w-0 text-[11px] text-on-surface-variant">
          <div className="truncate font-mono">{c.sellerId}</div>
          <div className="truncate">{c.description}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      width: "180px",
      cell: (c) => (
        <Badge
          variant={STATUS_VARIANT[c.status as CatalogClaimStatus] ?? "neutral"}
        >
          {statusLabel(c.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Ouvert le",
      width: "160px",
      cell: (c) => (
        <span className="text-[12px] text-on-surface-variant">
          {formatDateTimeFr(c.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="frost mb-4 flex flex-col gap-3 rounded-md p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-[13px] text-on-surface-variant">
          <PackageOpen className="h-4 w-4" />
          File des réclamations catalogue
        </div>
        <div className="w-full sm:w-56">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Filtrer par statut">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(c) => c.id}
        onRowClick={(c) => setActiveId(c.id)}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel={
          status !== STATUS_FILTER_ALL
            ? "Aucune réclamation pour ce statut."
            : "Aucune réclamation à traiter."
        }
        pageSize={PAGE_SIZE}
      />

      <CatalogClaimDrawer
        claimId={activeId}
        onClose={() => setActiveId(null)}
        onActed={() => {
          setActiveId(null);
          refetch();
        }}
      />
    </>
  );
}
