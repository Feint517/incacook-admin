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
import { formatEur, formatDateTimeFr } from "@/lib/utils";
import {
  ROLE_LABEL,
  WITHDRAWAL_STATUS_LABEL,
  WITHDRAWAL_STATUS_VARIANT,
  type UserRole,
  type WalletBalance,
  type WalletBalancesResponse,
  type Withdrawal,
  type WithdrawalsResponse,
} from "./types";

const PAGE_SIZE = 20;
const ALL = "ALL";
const eur = (cents: number) => formatEur(cents / 100, { cents: true });

export function PayoutsClient() {
  return (
    <Tabs defaultValue="balances">
      <TabsList>
        <TabsTrigger value="balances">Soldes</TabsTrigger>
        <TabsTrigger value="withdrawals">Versements</TabsTrigger>
      </TabsList>
      <TabsContent value="balances">
        <BalancesTab />
      </TabsContent>
      <TabsContent value="withdrawals">
        <WithdrawalsTab />
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
