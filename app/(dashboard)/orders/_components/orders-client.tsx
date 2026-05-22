"use client";

import { useMemo, useState } from "react";
import { Search, ShoppingBag, Activity, Wallet, Package } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { OrderStatusBadge } from "@/components/dashboard/status-badge";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { OrderDrawer } from "./order-drawer";
import { formatEur, formatNum, relativeTimeFr } from "@/lib/utils";
import { Truck, Store } from "lucide-react";
import type { Order } from "@/lib/mock-data/types";

interface Props {
  orders: Order[];
  stats: { today: number; active: number; avg: number; awaiting: number };
}

export function OrdersClient({ orders, stats }: Props) {
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [fulfillment, setFulfillment] = useState("all");
  const [city, setCity] = useState("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Order | null>(null);

  const cities = useMemo(() => Array.from(new Set(orders.map((o) => o.city))).sort(), [orders]);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (status !== "all" && o.status !== status) return false;
        if (category !== "all" && o.category !== category) return false;
        if (fulfillment !== "all" && o.fulfillment !== fulfillment) return false;
        if (city !== "all" && o.city !== city) return false;
        if (search && !o.id.includes(search.toLowerCase())) return false;
        return true;
      }),
    [orders, status, category, fulfillment, city, search],
  );

  const cols: Column<Order>[] = [
    {
      key: "id",
      header: "ID",
      cell: (o) => <span className="font-mono text-[12px] text-on-surface-variant">{o.id}</span>,
      width: "100px",
    },
    {
      key: "date",
      header: "Date",
      cell: (o) => <span className="text-[12px] text-on-surface-variant">{relativeTimeFr(o.date)}</span>,
      width: "120px",
    },
    {
      key: "buyer",
      header: "Acheteur",
      cell: (o) => <span className="text-[13px]">{o.buyerName}</span>,
    },
    {
      key: "seller",
      header: "Vendeur",
      cell: (o) => (
        <div className="min-w-0">
          <div className="truncate text-[13px]">{o.sellerName}</div>
          <CategoryBadge category={o.category} />
        </div>
      ),
    },
    {
      key: "items",
      header: "Articles",
      align: "center",
      cell: (o) => <span className="font-medium tabular-nums">{o.itemCount}</span>,
      width: "80px",
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (o) => <span className="font-semibold tabular-nums">{formatEur(o.total, { cents: true })}</span>,
      width: "100px",
    },
    {
      key: "fulfillment",
      header: "Type",
      cell: (o) => (
        <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
          {o.fulfillment === "delivery" ? <Truck className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
          {o.fulfillment === "delivery" ? "Livraison" : "Retrait"}
        </div>
      ),
      width: "110px",
    },
    { key: "status", header: "Statut", cell: (o) => <OrderStatusBadge status={o.status} />, width: "130px" },
    {
      key: "driver",
      header: "Livreur",
      cell: (o) => (
        <span className="text-[12px] text-on-surface-variant">{o.driverName ?? "—"}</span>
      ),
      width: "140px",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Commandes aujourd'hui" value={formatNum(stats.today)} icon={ShoppingBag} accent="primary" />
        <StatCard label="Commandes actives" value={formatNum(stats.active)} icon={Activity} accent="info" />
        <StatCard label="Panier moyen" value={formatEur(stats.avg, { cents: true })} icon={Wallet} accent="secondary" />
        <StatCard label="En attente livraison" value={formatNum(stats.awaiting)} icon={Package} accent="warning" />
      </div>

      <div className="frost mt-4 flex flex-wrap items-center gap-2 rounded-md p-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 w-[150px] text-xs">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="new">Nouvelle</SelectItem>
            <SelectItem value="accepted">Acceptée</SelectItem>
            <SelectItem value="preparing">En préparation</SelectItem>
            <SelectItem value="ready">Prête</SelectItem>
            <SelectItem value="delivering">En livraison</SelectItem>
            <SelectItem value="completed">Livrée</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 w-[170px] text-xs">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="faitMaison">Fait Maison</SelectItem>
            <SelectItem value="traiteur">Traiteur</SelectItem>
            <SelectItem value="restaurant">Restaurant</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fulfillment} onValueChange={setFulfillment}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="delivery">Livraison</SelectItem>
            <SelectItem value="pickup">Retrait</SelectItem>
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Ville" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes villes</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ID commande…"
            className="h-8 w-44 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="mt-3">
        <DataTable
          columns={cols}
          rows={filtered}
          rowKey={(o) => o.id}
          onRowClick={(o) => setActive(o)}
          pageSize={12}
        />
      </div>

      <OrderDrawer order={active} onClose={() => setActive(null)} />
    </>
  );
}
