"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
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
import { DisputeDrawer } from "./dispute-drawer";
import {
  STATUS_FILTERS,
  STATUS_FILTER_ALL,
  statusLabel,
  typeLabel,
  STATUS_VARIANT,
  type Dispute,
  type DisputeStatus,
} from "./types";

const PAGE_SIZE = 20;

export function DisputesClient() {
  const [status, setStatus] = useState(STATUS_FILTER_ALL);
  const [activeId, setActiveId] = useState<string | null>(null);

  // `GET /v1/admin/disputes` returns a bare array (no pagination envelope), so
  // paging is client-side via the DataTable. The optional `status` filter is
  // forwarded as a query param (omitted when set to the "all" sentinel).
  const { data, isLoading, isError, error, refetch } = useAdminQuery<Dispute[]>(
    {
      path: "/admin/disputes",
      params: {
        extra: status !== STATUS_FILTER_ALL ? { status } : undefined,
      },
    },
  );

  const rows = data ?? [];

  const cols: Column<Dispute>[] = [
    {
      key: "orderId",
      header: "Commande",
      cell: (d) => (
        <div className="min-w-0">
          <div className="truncate font-mono text-[12px] text-on-surface">
            {d.orderId}
          </div>
          <div className="truncate text-[11px] text-on-surface-variant">
            {typeLabel(d.type)}
          </div>
        </div>
      ),
    },
    {
      key: "parties",
      header: "Parties",
      width: "220px",
      cell: (d) => (
        <div className="min-w-0 text-[11px] text-on-surface-variant">
          <div className="truncate">
            <span className="text-on-surface">Acheteur</span> · {d.buyerId}
          </div>
          <div className="truncate">
            <span className="text-on-surface">Vendeur</span> · {d.sellerId}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      width: "150px",
      cell: (d) => (
        <Badge variant={STATUS_VARIANT[d.status as DisputeStatus] ?? "neutral"}>
          {statusLabel(d.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Ouvert le",
      width: "160px",
      cell: (d) => (
        <span className="text-[12px] text-on-surface-variant">
          {formatDateTimeFr(d.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="frost mb-4 flex flex-col gap-3 rounded-md p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-[13px] text-on-surface-variant">
          <Scale className="h-4 w-4" />
          File de résolution des litiges
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
        rowKey={(d) => d.id}
        onRowClick={(d) => setActiveId(d.id)}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel={
          status !== STATUS_FILTER_ALL
            ? "Aucun litige pour ce statut."
            : "Aucun litige à traiter."
        }
        pageSize={PAGE_SIZE}
      />

      <DisputeDrawer
        disputeId={activeId}
        onClose={() => setActiveId(null)}
        onActed={() => {
          setActiveId(null);
          refetch();
        }}
      />
    </>
  );
}
