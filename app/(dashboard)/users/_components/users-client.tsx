"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { Pagination } from "@/lib/api";
import { useAdminQuery } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { formatDateFr } from "@/lib/utils";
import { UserDrawer } from "./user-drawer";
import {
  fullName,
  initialsOf,
  UserRoleBadge,
  UserStatus,
  type AdminUser,
  type AdminUsersListResponse,
} from "./user-model";

const PAGE_SIZE = 20;

export function UsersClient() {
  // Server-driven list state — lifted here and fed into `useAdminQuery`.
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); // 1-based
  const [active, setActive] = useState<AdminUser | null>(null);

  // The backend contract is offset/limit (it ignores `page`). `useAdminQuery`
  // debounces `search` internally before it hits the wire.
  const { data, isLoading, isError, error, refetch } =
    useAdminQuery<AdminUsersListResponse>({
      path: "/admin/users",
      params: {
        search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      },
    });

  const rows = data ?? [];

  // The list endpoint returns a bare array (no `total`/`hasMore`), so synthesize
  // a next-only pagination envelope: a full page implies there may be more.
  const pagination: Pagination = {
    hasMore: rows.length >= PAGE_SIZE,
    total: null,
    nextCursor: null,
    page,
    limit: PAGE_SIZE,
  };

  const cols: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Utilisateur",
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{initialsOf(u)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-on-surface">
              {fullName(u)}
            </div>
            <div className="truncate text-[11px] text-on-surface-variant">
              {u.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      cell: (u) => <UserRoleBadge role={u.role} />,
      width: "140px",
    },
    {
      key: "phone",
      header: "Téléphone",
      cell: (u) => (
        <span className="text-[13px] tabular-nums text-on-surface-variant">
          {u.phone ?? "—"}
        </span>
      ),
      width: "150px",
    },
    {
      key: "rating",
      header: "Note",
      align: "right",
      cell: (u) =>
        u.averageRating != null ? (
          <span className="text-[13px] tabular-nums text-on-surface">
            {u.averageRating.toFixed(1)}
            <span className="text-on-surface-variant"> / 5</span>
            {u.reviewCount != null && (
              <span className="ml-1 text-[11px] text-on-surface-variant">
                ({u.reviewCount})
              </span>
            )}
          </span>
        ) : (
          <span className="text-[13px] text-on-surface-variant">—</span>
        ),
      width: "120px",
    },
    {
      key: "status",
      header: "Statut",
      cell: (u) => <UserStatus user={u} />,
      width: "120px",
    },
    {
      key: "joined",
      header: "Inscrit le",
      cell: (u) => (
        <span className="text-[13px] text-on-surface-variant">
          {formatDateFr(u.createdAt)}
        </span>
      ),
      width: "110px",
    },
  ];

  return (
    <>
      <div className="frost mb-3 flex items-center justify-end rounded-md p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // new query resets to the first page
            }}
            placeholder="Rechercher (nom, email, téléphone, id)…"
            className="h-8 w-72 pl-8 text-xs"
          />
        </div>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(u) => u.id}
        onRowClick={(u) => setActive(u)}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel={
          search
            ? "Aucun utilisateur ne correspond à cette recherche."
            : "Aucun utilisateur."
        }
        serverPagination={{
          pagination,
          page,
          onPageChange: setPage,
          pageSize: PAGE_SIZE,
          isFetching: isLoading,
        }}
      />

      <UserDrawer user={active} onClose={() => setActive(null)} />
    </>
  );
}
