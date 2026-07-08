"use client";

import { useState } from "react";
import { Search, Crown } from "lucide-react";
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
import { formatDateFr } from "@/lib/utils";
import {
  ProviderBadge,
  STATUS_OPTIONS,
  SubscriptionStatusBadge,
  planLabel,
  type AdminSubscription,
  type AdminSubscriptionsListResponse,
  type SubscriptionStatus,
} from "./subscription-model";

const PAGE_SIZE = 20;
const ALL = "ALL";

export function SubscriptionsClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | typeof ALL>(ALL);
  const [page, setPage] = useState(1);

  const { data, pagination, isLoading, isError, error, refetch } =
    useAdminQuery<AdminSubscriptionsListResponse>({
      path: "/admin/subscriptions",
      params: {
        search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        extra: status !== ALL ? { status } : undefined,
      },
    });

  const rows = data ?? [];

  const cols: Column<AdminSubscription>[] = [
    {
      key: "seller",
      header: "Vendeur",
      cell: (s) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-on-surface">{s.name || "—"}</div>
          <div className="truncate text-[11px] text-on-surface-variant">{s.email}</div>
        </div>
      ),
    },
    { key: "status", header: "Statut", cell: (s) => <SubscriptionStatusBadge status={s.subscriptionStatus} /> },
    {
      key: "plan",
      header: "Formule",
      cell: (s) => (
        <span className="inline-flex items-center gap-1 text-[13px] text-on-surface">
          {s.isPremium && <Crown className="h-3.5 w-3.5 text-warning" />}
          {planLabel(s)}
        </span>
      ),
    },
    { key: "provider", header: "Fournisseur", cell: (s) => <ProviderBadge provider={s.provider} /> },
    {
      key: "period",
      header: "Fin de période",
      cell: (s) => (
        <span className="text-[12px] text-on-surface-variant">
          {s.currentPeriodEnd ? formatDateFr(s.currentPeriodEnd) : "—"}
        </span>
      ),
    },
    {
      key: "trial",
      header: "Essai jusqu'au",
      cell: (s) => (
        <span className="text-[12px] text-on-surface-variant">
          {s.trialEndsAt ? formatDateFr(s.trialEndsAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un vendeur…"
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as SubscriptionStatus | typeof ALL); setPage(1); }}>
          <SelectTrigger className="w-[190px]"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les statuts</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(s) => s.sellerId}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel="Aucun abonnement."
        serverPagination={{ pagination, page, onPageChange: setPage, pageSize: PAGE_SIZE }}
      />
    </div>
  );
}
