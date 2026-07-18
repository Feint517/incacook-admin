"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useAdminQuery } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEurFromCents, formatDateTimeFr } from "@/lib/utils";
import {
  ROLE_LABEL,
  WITHDRAWAL_STATUS_LABEL,
  WITHDRAWAL_STATUS_VARIANT,
  RECONCILE_ISSUE_LABEL,
  RECONCILE_ISSUE_VARIANT,
  type UserRole,
  type WalletBalance,
  type WalletBalancesResponse,
  type Withdrawal,
  type WithdrawalsResponse,
  type ReconcileItem,
  type ReconcileResponse,
} from "./types";

const PAGE_SIZE = 20;
const ALL = "ALL";
const eur = formatEurFromCents;

export function PayoutsClient() {
  return (
    <Tabs defaultValue="balances">
      <TabsList>
        <TabsTrigger value="balances">Soldes</TabsTrigger>
        <TabsTrigger value="withdrawals">Versements</TabsTrigger>
        <TabsTrigger value="reconcile">Réconciliation</TabsTrigger>
      </TabsList>
      <TabsContent value="balances">
        <BalancesTab />
      </TabsContent>
      <TabsContent value="withdrawals">
        <WithdrawalsTab />
      </TabsContent>
      <TabsContent value="reconcile">
        <ReconcileTab />
      </TabsContent>
    </Tabs>
  );
}

function BalancesTab() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | typeof ALL>(ALL);
  const [page, setPage] = useState(1);

  const { data, pagination, isLoading, isError, error, refetch } =
    useAdminQuery<WalletBalancesResponse>({
      path: "/admin/wallets",
      params: {
        search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        extra: role !== ALL ? { role } : undefined,
      },
    });

  const cols: Column<WalletBalance>[] = [
    {
      key: "user",
      header: "Bénéficiaire",
      cell: (w) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-on-surface">{w.name || "—"}</div>
          <div className="truncate text-[11px] text-on-surface-variant">{w.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      cell: (w) => <Badge variant="neutral">{ROLE_LABEL[w.role] ?? w.role}</Badge>,
    },
    { key: "available", header: "Disponible", align: "right", cell: (w) => <span className="font-medium tabular-nums text-success">{eur(w.availableCents)}</span> },
    { key: "pending", header: "En attente", align: "right", cell: (w) => <span className="tabular-nums text-on-surface-variant">{eur(w.pendingCents)}</span> },
    { key: "held", header: "Bloqué", align: "right", cell: (w) => <span className="tabular-nums">{w.heldCents ? eur(w.heldCents) : "—"}</span> },
    { key: "paid", header: "Versé", align: "right", cell: (w) => <span className="tabular-nums text-on-surface-variant">{eur(w.paidOutCents)}</span> },
  ];

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher un bénéficiaire…" className="pl-8" />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v as UserRole | typeof ALL); setPage(1); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Rôle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous</SelectItem>
            <SelectItem value="SELLER">Vendeurs</SelectItem>
            <SelectItem value="DRIVER">Livreurs</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={cols}
        rows={data ?? []}
        rowKey={(w) => w.userId}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel="Aucun solde."
        serverPagination={{ pagination, page, onPageChange: setPage, pageSize: PAGE_SIZE }}
      />
    </div>
  );
}

function WithdrawalsTab() {
  const [page, setPage] = useState(1);
  const { data, pagination, isLoading, isError, error, refetch } =
    useAdminQuery<WithdrawalsResponse>({
      path: "/admin/withdrawals",
      params: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    });

  const cols: Column<Withdrawal>[] = [
    {
      key: "date",
      header: "Date",
      cell: (w) => <span className="text-[12px] text-on-surface-variant">{formatDateTimeFr(w.createdAt)}</span>,
    },
    { key: "name", header: "Bénéficiaire", cell: (w) => <span className="text-[13px] text-on-surface">{w.name || "—"}</span> },
    { key: "amount", header: "Montant", align: "right", cell: (w) => <span className="font-medium tabular-nums">{eur(w.amountCents)}</span> },
    {
      key: "status",
      header: "Statut",
      cell: (w) => <Badge variant={WITHDRAWAL_STATUS_VARIANT[w.status]}>{WITHDRAWAL_STATUS_LABEL[w.status]}</Badge>,
    },
    {
      key: "transfer",
      header: "Transfert Stripe",
      cell: (w) => <span className="font-mono text-[11px] text-on-surface-variant">{w.transferId ?? "—"}</span>,
    },
  ];

  return (
    <div className="mt-4">
      <DataTable
        columns={cols}
        rows={data ?? []}
        rowKey={(w) => w.id}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel="Aucun versement."
        serverPagination={{ pagination, page, onPageChange: setPage, pageSize: PAGE_SIZE }}
      />
    </div>
  );
}

const RECONCILE_LIMIT = 50;

/**
 * Compares recent WITHDRAWAL rows directly against their Stripe transfer
 * (issue #7/#12) — a missing transfer, an amount mismatch, or a reversal the
 * webhook missed. Not a paginated list (no hasMore/total from the backend),
 * so no `serverPagination` here — `userId` narrows to one beneficiary
 * instead of paging through everyone's history.
 */
function ReconcileTab() {
  const [userId, setUserId] = useState("");

  const { data, isLoading, isError, error, refetch } =
    useAdminQuery<ReconcileResponse>({
      path: "/admin/withdrawals/reconcile",
      params: {
        limit: RECONCILE_LIMIT,
        extra: userId.trim() ? { userId: userId.trim() } : undefined,
      },
    });

  const items = data?.items ?? [];
  const flaggedCount = items.filter((i) => i.issue !== "ok").length;

  const cols: Column<ReconcileItem>[] = [
    {
      key: "withdrawal",
      header: "Retrait",
      cell: (r) => <span className="font-mono text-[11px] text-on-surface-variant">{r.withdrawalId}</span>,
    },
    {
      key: "user",
      header: "Bénéficiaire",
      cell: (r) => <span className="font-mono text-[11px] text-on-surface-variant">{r.userId}</span>,
    },
    {
      key: "amount",
      header: "Montant (ledger)",
      align: "right",
      cell: (r) => <span className="font-medium tabular-nums">{eur(r.ledgerAmountCents)}</span>,
    },
    {
      key: "transfer",
      header: "Transfert Stripe",
      cell: (r) => <span className="font-mono text-[11px] text-on-surface-variant">{r.transferId ?? "—"}</span>,
    },
    {
      key: "issue",
      header: "État",
      cell: (r) => <Badge variant={RECONCILE_ISSUE_VARIANT[r.issue]}>{RECONCILE_ISSUE_LABEL[r.issue]}</Badge>,
    },
    {
      key: "detail",
      header: "Écart",
      align: "right",
      cell: (r) => {
        if (r.issue === "amount_mismatch" && r.stripeAmountCents != null) {
          return <span className="tabular-nums text-error">Stripe : {eur(r.stripeAmountCents)}</span>;
        }
        if (r.issue === "reversed_uncovered" && r.amountReversedCents != null) {
          return <span className="tabular-nums text-warning">{eur(r.amountReversedCents)} non couvert</span>;
        }
        return <span className="text-on-surface-variant">—</span>;
      },
    },
  ];

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Filtrer par identifiant bénéficiaire…"
            className="pl-8"
          />
        </div>
        {!isLoading && !isError && (
          <span className="text-[12px] text-on-surface-variant">
            {flaggedCount > 0
              ? `${flaggedCount} anomalie(s) sur ${items.length} retrait(s)`
              : `${items.length} retrait(s), aucune anomalie`}
          </span>
        )}
      </div>
      <DataTable
        columns={cols}
        rows={items}
        rowKey={(r) => r.withdrawalId}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel="Aucun retrait à réconcilier."
      />
    </div>
  );
}
