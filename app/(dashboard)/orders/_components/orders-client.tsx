"use client";

import { useState } from "react";
import { Search, Truck, Store } from "lucide-react";
import { useAdminQuery } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatEur, relativeTimeFr } from "@/lib/utils";
import { OrderDrawer } from "./order-drawer";
import {
  cityLabel,
  ORDER_STATUS_FILTERS,
  OrderCategoryBadge,
  OrderStatusBadge,
  toEuros,
  type AdminOrder,
  type AdminOrdersListResponse,
  type OrderStatus,
} from "./order-model";

const PAGE_SIZE = 20;

const ALL = "all";

export function OrdersClient() {
  // Server-driven list state — lifted here and fed into `useAdminQuery`.
  const [status, setStatus] = useState<OrderStatus | typeof ALL>(ALL);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); // 1-based
  const [active, setActive] = useState<AdminOrder | null>(null);

  // Offset/limit contract; `useAdminQuery` debounces `search` before the wire.
  // The endpoint returns `{ items, hasMore }` (NO total) → `pagination.hasMore`
  // from the hook drives next-only pagination.
  const { data, pagination, isLoading, isError, error, refetch } =
    useAdminQuery<AdminOrdersListResponse>({
      path: "/admin/orders",
      params: {
        search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        extra: {
          ...(status !== ALL ? { status } : {}),
        },
      },
    });

  const rows = data ?? [];

  function changeStatusFilter(next: OrderStatus | typeof ALL) {
    setStatus(next);
    setPage(1); // new query resets to the first page
  }

  const cols: Column<AdminOrder>[] = [
    {
      key: "orderNumber",
      header: "Commande",
      cell: (o) => (
        <span className="font-mono text-[12px] text-on-surface-variant">
          {o.orderNumber}
        </span>
      ),
      width: "120px",
    },
    {
      key: "date",
      header: "Date",
      cell: (o) => (
        <span className="text-[12px] text-on-surface-variant">
          {relativeTimeFr(o.createdAt)}
        </span>
      ),
      width: "120px",
    },
    {
      key: "buyer",
      header: "Acheteur",
      cell: (o) => <span className="text-[13px]">{o.buyer.name || "—"}</span>,
    },
    {
      key: "seller",
      header: "Vendeur",
      cell: (o) => (
        <div className="min-w-0">
          <div className="truncate text-[13px]">{o.seller.name || "—"}</div>
          <OrderCategoryBadge category={o.category} />
        </div>
      ),
    },
    {
      key: "items",
      header: "Articles",
      align: "center",
      cell: (o) => (
        <span className="font-medium tabular-nums">{o.itemCount}</span>
      ),
      width: "80px",
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (o) => (
        <span className="font-semibold tabular-nums">
          {formatEur(toEuros(o.totalCents), { cents: true })}
        </span>
      ),
      width: "100px",
    },
    {
      key: "fulfillment",
      header: "Type",
      cell: (o) => (
        <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
          {o.fulfillment === "delivery" ? (
            <Truck className="h-3.5 w-3.5" />
          ) : (
            <Store className="h-3.5 w-3.5" />
          )}
          {o.fulfillment === "delivery" ? "Livraison" : "Retrait"}
        </div>
      ),
      width: "110px",
    },
    {
      key: "city",
      header: "Ville",
      cell: (o) => (
        <span className="text-[12px] text-on-surface-variant">
          {cityLabel(o)}
        </span>
      ),
      width: "120px",
    },
    {
      key: "status",
      header: "Statut",
      cell: (o) => <OrderStatusBadge status={o.status} />,
      width: "140px",
    },
    {
      key: "driver",
      header: "Livreur",
      cell: (o) => (
        <span className="text-[12px] text-on-surface-variant">
          {o.driver?.name ?? "—"}
        </span>
      ),
      width: "140px",
    },
  ];

  return (
    <>
      <div className="frost mb-3 flex flex-wrap items-center gap-2 rounded-md p-3">
        <Select
          value={status}
          onValueChange={(v) => changeStatusFilter(v as OrderStatus | typeof ALL)}
        >
          <SelectTrigger
            className="h-8 w-[170px] text-xs"
            aria-label="Filtrer par statut"
          >
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous statuts</SelectItem>
            {ORDER_STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // new query resets to the first page
            }}
            placeholder="N° commande, id, acheteur…"
            className="h-8 w-64 pl-8 text-xs"
          />
        </div>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(o) => o.id}
        onRowClick={(o) => setActive(o)}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel={
          search || status !== ALL
            ? "Aucune commande ne correspond à ces filtres."
            : "Aucune commande."
        }
        serverPagination={{
          pagination,
          page,
          onPageChange: setPage,
          pageSize: PAGE_SIZE,
          isFetching: isLoading,
        }}
      />

      <OrderDrawer order={active} onClose={() => setActive(null)} />
    </>
  );
}
