"use client";

/**
 * Overview dashboard — client data layer. Fetches the seven
 * `/v1/admin/dashboard/*` aggregates through `useAdminQuery` (which routes the
 * admin bearer + 401 refresh for us) and feeds the existing visual components.
 *
 * Widget → endpoint map:
 *   KPI headline cards          → /admin/dashboard/overview
 *   role breakdown stat cards   → /admin/dashboard/users
 *   revenue detail stat cards   → /admin/dashboard/revenue
 *   chart "Par catégorie"       → /admin/dashboard/categories
 *   chart "Par ville"           → /admin/dashboard/cities
 *   récurrents tile             → /admin/dashboard/recurring-users
 *   mono-transaction tile       → /admin/dashboard/mono-users
 *
 * The date-range selector drives `?range=…` on the endpoints that honour it
 * (overview / users / revenue / categories / cities); recurring/mono use their
 * fixed server-side windows.
 */

import { useState } from "react";
import { Users, ShoppingBag, Wallet, Repeat, UserCheck, Store, Bike, Package } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTableError } from "@/components/dashboard/data-table-states";
import { useAdminQuery } from "@/lib/query";
import { cn, formatEur, formatNum } from "@/lib/utils";
import {
  OverviewActivityChart,
  type BreakdownDatum,
} from "./overview-activity-chart";

// ---- response shapes (mirror the server DTOs; kept local per task scope) ----

interface OverviewResponse {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalDrivers: number;
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  totalRevenueCents: number;
  totalCommissionCents: number;
  totalDeliveryFeeCents: number;
  recurringUsersCount: number;
  monoUsersCount: number;
  range: { from: string | null; to: string | null };
}

interface UsersResponse {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalDrivers: number;
  recurringUsersCount: number;
  monoUsersCount: number;
}

type ServerSellerCategory = "FAIT_MAISON" | "TRAITEUR" | "RESTAURANT";

interface CategoryRow {
  category: ServerSellerCategory;
  orderCount: number;
  revenueCents: number;
  commissionCents: number;
}

interface CityRow {
  city: string;
  orderCount: number;
  revenueCents: number;
}

interface RevenueResponse {
  totalRevenueCents: number;
  totalCommissionCents: number;
  totalDeliveryFeeCents: number;
  byCategory: CategoryRow[];
  byCity: CityRow[];
}

interface CountResponse {
  count: number;
  userIds: string[];
}

// ---- period selector --------------------------------------------------------

const PERIODS = [
  { key: "today", label: "Aujourd'hui" },
  { key: "last7Days", label: "7 jours" },
  { key: "last30Days", label: "30 jours" },
  { key: "all", label: "Tout" },
] as const;
type PeriodKey = (typeof PERIODS)[number]["key"];

const CATEGORY_LABELS: Record<ServerSellerCategory, string> = {
  FAIT_MAISON: "Fait maison",
  TRAITEUR: "Traiteur",
  RESTAURANT: "Restaurant",
};

/** Cents → euros. */
const eur = (cents: number | undefined | null) => formatEur((cents ?? 0) / 100);
/** Formatted count, or an em dash while the value is still loading. */
const num = (v: number | undefined | null) => (v == null ? "—" : formatNum(v));

export function OverviewClient() {
  const [period, setPeriod] = useState<PeriodKey>("last30Days");
  const rangeParams = { extra: { range: period } };

  const overview = useAdminQuery<OverviewResponse>({
    path: "/admin/dashboard/overview",
    params: rangeParams,
  });
  const usersQ = useAdminQuery<UsersResponse>({
    path: "/admin/dashboard/users",
    params: rangeParams,
  });
  const revenueQ = useAdminQuery<RevenueResponse>({
    path: "/admin/dashboard/revenue",
    params: rangeParams,
  });
  const categoriesQ = useAdminQuery<CategoryRow[]>({
    path: "/admin/dashboard/categories",
    params: rangeParams,
  });
  const citiesQ = useAdminQuery<CityRow[]>({
    path: "/admin/dashboard/cities",
    params: rangeParams,
  });
  // recurring/mono ignore the date filter server-side (fixed windows).
  const recurringQ = useAdminQuery<CountResponse>({
    path: "/admin/dashboard/recurring-users",
  });
  const monoQ = useAdminQuery<CountResponse>({
    path: "/admin/dashboard/mono-users",
  });

  const o = overview.data;
  const u = usersQ.data;
  const r = revenueQ.data;

  const byCategory: BreakdownDatum[] = (categoriesQ.data ?? []).map((row) => ({
    label: CATEGORY_LABELS[row.category] ?? row.category,
    revenue: row.revenueCents / 100,
    orders: row.orderCount,
  }));
  const byCity: BreakdownDatum[] = (citiesQ.data ?? []).map((row) => ({
    label: row.city,
    revenue: row.revenueCents / 100,
    orders: row.orderCount,
  }));

  const refetchAll = () => {
    overview.refetch();
    usersQ.refetch();
    revenueQ.refetch();
    categoriesQ.refetch();
    citiesQ.refetch();
    recurringQ.refetch();
    monoQ.refetch();
  };

  return (
    <>
      {/* Period selector */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {PERIODS.map((p) => {
          const isOn = period === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isOn
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Primary state: gate the KPI headline on the overview query. */}
      {overview.isError ? (
        <DataTableError error={overview.error} onRetry={refetchAll} />
      ) : overview.isLoading && !o ? (
        <OverviewSkeleton />
      ) : (
        <>
          {/* KPI headline — overview endpoint */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Utilisateurs" value={num(o?.totalUsers)} accent="info" />
            <KpiCard label="Commandes" value={num(o?.totalOrders)} accent="primary" />
            <KpiCard label="Revenu payé" value={eur(o?.totalRevenueCents)} accent="success" />
            <KpiCard label="Annonces actives" value={num(o?.activeListings)} accent="secondary" />
          </div>

          {/* Role breakdown — users endpoint (falls back to overview counts) */}
          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Acheteurs" value={num(u?.totalBuyers ?? o?.totalBuyers)} icon={UserCheck} accent="info" />
            <StatCard label="Vendeurs" value={num(u?.totalSellers ?? o?.totalSellers)} icon={Store} accent="primary" />
            <StatCard label="Livreurs" value={num(u?.totalDrivers ?? o?.totalDrivers)} icon={Bike} accent="secondary" />
            <StatCard
              label="Récurrents"
              value={num(recurringQ.data?.count)}
              hint="≥2 paiements / 7 j"
              icon={Repeat}
              accent="success"
            />
            <StatCard
              label="Mono-transaction"
              value={num(monoQ.data?.count)}
              hint="1 seul paiement"
              icon={Users}
              accent="warning"
            />
          </div>

          {/* Revenue detail — revenue endpoint */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Revenu total" value={eur(r?.totalRevenueCents ?? o?.totalRevenueCents)} icon={Wallet} accent="success" />
            <StatCard label="Commission" value={eur(r?.totalCommissionCents ?? o?.totalCommissionCents)} icon={ShoppingBag} accent="primary" />
            <StatCard label="Frais de livraison" value={eur(r?.totalDeliveryFeeCents ?? o?.totalDeliveryFeeCents)} icon={Package} accent="info" />
          </div>

          {/* Breakdown chart — categories + cities endpoints */}
          <div className="mt-3">
            {categoriesQ.isError && citiesQ.isError ? (
              <DataTableError
                error={categoriesQ.error ?? citiesQ.error}
                onRetry={() => {
                  categoriesQ.refetch();
                  citiesQ.refetch();
                }}
              />
            ) : (categoriesQ.isLoading && !categoriesQ.data) ||
              (citiesQ.isLoading && !citiesQ.data) ? (
              <div className="h-[360px] animate-pulse rounded-md border border-outline-variant bg-surface-container-low" />
            ) : (
              <OverviewActivityChart byCategory={byCategory} byCity={byCity} />
            )}
          </div>
        </>
      )}
    </>
  );
}

/** Full-page loading placeholder shown before the first overview payload. */
function OverviewSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-md border border-outline-variant bg-surface-container-low" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[88px] animate-pulse rounded-md border border-outline-variant bg-surface-container-low" />
        ))}
      </div>
      <div className="h-[360px] animate-pulse rounded-md border border-outline-variant bg-surface-container-low" />
    </div>
  );
}
