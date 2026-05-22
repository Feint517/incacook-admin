"use client";

import { useMemo, useState } from "react";
import { Search, Repeat, UserPlus, User2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { RoleBadge } from "@/components/dashboard/role-badge";
import { UserStatusBadge } from "@/components/dashboard/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { UserDrawer } from "./user-drawer";
import { formatDateFr, formatNum, relativeTimeFr } from "@/lib/utils";
import type { Order, Seller, User } from "@/lib/mock-data/types";

interface Props {
  users: User[];
  sellers: Seller[];
  stats: { total: number; recurring: number; newThisWeek: number };
  ordersByUserId: Record<string, Order[]>;
}

export function UsersClient({ users, sellers, stats, ordersByUserId }: Props) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<User | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (tab === "buyers" && u.role !== "buyer") return false;
      if (tab === "sellers" && !u.role.startsWith("seller-")) return false;
      if (tab === "drivers" && u.role !== "driver") return false;
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [users, tab, search]);

  const cols: Column<User>[] = [
    {
      key: "name",
      header: "Utilisateur",
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7">
            <AvatarImage src={u.avatar} alt={u.name} />
            <AvatarFallback>{u.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-on-surface">{u.name}</div>
            <div className="truncate text-[11px] text-on-surface-variant">{u.email}</div>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Rôle", cell: (u) => <RoleBadge role={u.role} />, width: "200px" },
    { key: "city", header: "Ville", cell: (u) => <span className="text-[13px]">{u.city}</span>, width: "120px" },
    {
      key: "joined",
      header: "Inscrit le",
      cell: (u) => <span className="text-[13px] text-on-surface-variant">{formatDateFr(u.joined)}</span>,
      width: "110px",
    },
    {
      key: "transactions",
      header: "Transactions",
      align: "right",
      cell: (u) => <span className="font-medium tabular-nums">{formatNum(u.totalTransactions)}</span>,
      width: "120px",
    },
    { key: "status", header: "Statut", cell: (u) => <UserStatusBadge status={u.status} />, width: "120px" },
    {
      key: "active",
      header: "Dernière activité",
      cell: (u) => <span className="text-[12px] text-on-surface-variant">{relativeTimeFr(u.lastActive)}</span>,
      width: "140px",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total utilisateurs" value={formatNum(stats.total)} icon={User2} accent="info" />
        <StatCard
          label="Récurrents"
          value={formatNum(stats.recurring)}
          hint="≥ 2 transactions"
          icon={Repeat}
          accent="primary"
        />
        <StatCard label="Nouveaux cette semaine" value={formatNum(stats.newThisWeek)} icon={UserPlus} accent="success" />
      </div>

      <div className="frost mt-4 flex flex-col gap-3 rounded-md p-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="buyers">Acheteurs</TabsTrigger>
            <TabsTrigger value="sellers">Vendeurs</TabsTrigger>
            <TabsTrigger value="drivers">Livreurs</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="h-8 w-48 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="mt-3">
        <DataTable
          columns={cols}
          rows={filtered}
          rowKey={(u) => u.id}
          onRowClick={(u) => setActive(u)}
          pageSize={12}
        />
      </div>

      <UserDrawer
        user={active}
        seller={active ? sellers.find((s) => s.id === active.id) : undefined}
        orders={active ? ordersByUserId[active.id] || [] : []}
        onClose={() => setActive(null)}
      />
    </>
  );
}
