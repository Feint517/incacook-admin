"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, ImageOff, AlertTriangle } from "lucide-react";
import { useAdminQuery } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEurFromCents, formatNum } from "@/lib/utils";
import { ListingDrawer } from "./listing-drawer";
import {
  CategoryChip,
  CuisineChip,
  DietChip,
  ListingStatus,
  STATUS_OPTIONS,
  type AdminListing,
  type AdminListingStatus,
  type AdminListingsListResponse,
} from "./listing-model";

const PAGE_SIZE = 20;

/** Small square thumbnail; `unoptimized` so remote/expiring seller URLs load. */
function Thumb({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant">
        <ImageOff className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-container-high">
      <Image src={src} alt={alt} fill sizes="40px" unoptimized className="object-cover" />
    </div>
  );
}

export function ListingsClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminListingStatus | "all">("all");
  const [page, setPage] = useState(1); // 1-based
  const [active, setActive] = useState<AdminListing | null>(null);

  // Offset/limit contract; `useAdminQuery` debounces `search` before the wire.
  // `status` is forwarded as an extra query param only when a value is picked.
  const { data, pagination, isLoading, isError, error, refetch } =
    useAdminQuery<AdminListingsListResponse>({
      path: "/admin/listings",
      params: {
        search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        extra: status !== "all" ? { status } : undefined,
      },
    });

  const rows = data ?? [];

  const cols: Column<AdminListing>[] = [
    {
      key: "listing",
      header: "Annonce",
      cell: (l) => (
        <div className="flex items-center gap-2.5">
          <Thumb src={l.photo} alt={l.title} />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-on-surface">{l.title}</div>
            <div className="truncate text-[11px] text-on-surface-variant">{l.sellerName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (l) => <ListingStatus status={l.status} />,
      width: "110px",
    },
    {
      key: "category",
      header: "Catégorie",
      cell: (l) => <CategoryChip category={l.category} />,
      width: "120px",
    },
    {
      key: "tags",
      header: "Cuisine / Régimes",
      cell: (l) => {
        const hasTags =
          l.cuisineTypes.length > 0 ||
          l.dietaryTags.length > 0 ||
          l.dishTypes.length > 0;
        if (!hasTags) return <span className="text-[13px] text-on-surface-variant">—</span>;
        return (
          <div className="flex flex-wrap items-center gap-1">
            {l.cuisineTypes.map((c) => (
              <CuisineChip key={`c-${c}`} cuisine={c} />
            ))}
            {l.dietaryTags.map((d) => (
              <DietChip key={`d-${d}`} tag={d} />
            ))}
          </div>
        );
      },
      width: "220px",
    },
    {
      key: "price",
      header: "Prix",
      align: "right",
      cell: (l) => (
        <span className="text-[13px] tabular-nums text-on-surface">
          {formatEurFromCents(l.priceCents)}
        </span>
      ),
      width: "100px",
    },
    {
      key: "portions",
      header: "Restant",
      align: "right",
      cell: (l) => (
        <span className="text-[13px] tabular-nums text-on-surface-variant">
          {l.portionsLeft ?? "—"}
        </span>
      ),
      width: "90px",
    },
    {
      key: "orders",
      header: "Commandes",
      align: "right",
      cell: (l) => (
        <span className="text-[13px] tabular-nums text-on-surface-variant">
          {formatNum(l.orderCount)}
        </span>
      ),
      width: "110px",
    },
    {
      key: "reports",
      header: "Signalements",
      align: "right",
      cell: (l) =>
        l.reportCount > 0 ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-medium tabular-nums text-error">
            <AlertTriangle className="h-3.5 w-3.5" />
            {formatNum(l.reportCount)}
          </span>
        ) : (
          <span className="text-[13px] tabular-nums text-on-surface-variant">0</span>
        ),
      width: "120px",
    },
  ];

  return (
    <>
      <div className="frost mb-3 flex flex-wrap items-center gap-2 rounded-md p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // new query resets to the first page
            }}
            placeholder="Rechercher une annonce…"
            className="h-8 w-72 pl-8 text-xs"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as AdminListingStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[150px] text-xs">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(l) => l.id}
        onRowClick={(l) => setActive(l)}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel={
          search || status !== "all"
            ? "Aucune annonce ne correspond à ces filtres."
            : "Aucune annonce."
        }
        serverPagination={{
          pagination,
          page,
          onPageChange: setPage,
          pageSize: PAGE_SIZE,
          isFetching: isLoading,
        }}
      />

      <ListingDrawer listing={active} onClose={() => setActive(null)} />
    </>
  );
}
