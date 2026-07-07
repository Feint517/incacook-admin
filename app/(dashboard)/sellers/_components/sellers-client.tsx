"use client";

import { useState } from "react";
import { Search, Star, Tag } from "lucide-react";
import { useAdminQuery } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateFr, formatEur, formatNum } from "@/lib/utils";
import { SellerDrawer } from "./seller-drawer";
import {
  CATEGORY_OPTIONS,
  SellerCategoryBadge,
  SellerStatus,
  SellerTierBadge,
  initialsOf,
  type AdminSeller,
  type AdminSellersListResponse,
  type SellerCategory,
} from "./seller-model";

const PAGE_SIZE = 20;

/** Sentinel for "no category filter" — Radix `Select` can't use an empty value. */
const ALL = "ALL";

export function SellersClient() {
  // Server-driven list state — lifted here and fed into `useAdminQuery`.
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SellerCategory | typeof ALL>(ALL);
  const [page, setPage] = useState(1); // 1-based
  const [active, setActive] = useState<AdminSeller | null>(null);

  // Offset/limit contract; `search` is debounced inside the hook. The category
  // filter rides along as an `extra` query param when one is selected.
  const { data, pagination, isLoading, isError, error, refetch } =
    useAdminQuery<AdminSellersListResponse>({
      path: "/admin/sellers",
      params: {
        search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        extra: category !== ALL ? { category } : undefined,
      },
    });

  const rows = data ?? [];

  const cols: Column<AdminSeller>[] = [
    {
      key: "name",
      header: "Vendeur",
      cell: (s) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{initialsOf(s.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-on-surface">
              {s.name}
            </div>
            <div className="truncate text-[11px] text-on-surface-variant">
              {s.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      cell: (s) => <SellerCategoryBadge category={s.category} />,
      width: "130px",
    },
    {
      key: "rating",
      header: "Note",
      align: "right",
      cell: (s) =>
        s.rating != null ? (
          <span className="inline-flex items-center gap-1 text-[13px] tabular-nums text-on-surface">
            <Star className="h-3 w-3 fill-current text-warning" />
            {s.rating.toFixed(1)}
            <span className="ml-0.5 text-[11px] text-on-surface-variant">
              ({s.ratingCount})
            </span>
          </span>
        ) : (
          <span className="text-[13px] text-on-surface-variant">—</span>
        ),
      width: "120px",
    },
    {
      key: "totalSales",
      header: "Ventes",
      align: "right",
      cell: (s) => (
        <span className="text-[13px] tabular-nums text-on-surface">
          {formatNum(s.totalSales)}
        </span>
      ),
      width: "90px",
    },
    {
      key: "revenue",
      header: "CA",
      align: "right",
      cell: (s) => (
        <span className="text-[13px] tabular-nums text-on-surface">
          {formatEur(s.totalRevenueCents / 100)}
        </span>
      ),
      width: "110px",
    },
    {
      key: "activeListings",
      header: "Annonces",
      align: "right",
      cell: (s) => (
        <span className="inline-flex items-center gap-1 text-[13px] tabular-nums text-on-surface-variant">
          <Tag className="h-3 w-3" />
          {formatNum(s.activeListings)}
        </span>
      ),
      width: "100px",
    },
    {
      key: "tier",
      header: "Abonnement",
      cell: (s) => <SellerTierBadge tier={s.subscriptionTier} />,
      width: "120px",
    },
    {
      key: "status",
      header: "Statut",
      cell: (s) => <SellerStatus seller={s} />,
      width: "110px",
    },
    {
      key: "joined",
      header: "Inscrit le",
      cell: (s) => (
        <span className="text-[13px] text-on-surface-variant">
          {formatDateFr(s.createdAt)}
        </span>
      ),
      width: "110px",
    },
  ];

  return (
    <>
      <div className="frost mb-3 flex flex-wrap items-center justify-end gap-2 rounded-md p-3">
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v as SellerCategory | typeof ALL);
            setPage(1); // new filter resets to the first page
          }}
        >
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les catégories</SelectItem>
            {CATEGORY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // new query resets to the first page
            }}
            placeholder="Rechercher (nom, email)…"
            className="h-8 w-72 pl-8 text-xs"
          />
        </div>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(s) => s.id}
        onRowClick={(s) => setActive(s)}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel={
          search || category !== ALL
            ? "Aucun vendeur ne correspond à ces critères."
            : "Aucun vendeur."
        }
        serverPagination={{
          pagination,
          page,
          onPageChange: setPage,
          pageSize: PAGE_SIZE,
          isFetching: isLoading,
        }}
      />

      <SellerDrawer seller={active} onClose={() => setActive(null)} />
    </>
  );
}
