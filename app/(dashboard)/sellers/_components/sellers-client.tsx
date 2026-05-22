"use client";

import { useMemo, useState } from "react";
import { Star, Users, UserPlus, Sparkles, ShieldCheck, ShieldAlert, Tag } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SellerDrawer } from "./seller-drawer";
import { formatEur, formatNum, relativeTimeFr } from "@/lib/utils";
import type { Seller } from "@/lib/mock-data/types";

interface Props {
  sellers: Seller[];
  stats: { active: number; newWeek: number; avgRating: number; premiums: number };
}

export function SellersClient({ sellers, stats }: Props) {
  const [tab, setTab] = useState("all");
  const [active, setActive] = useState<Seller | null>(null);

  const filtered = useMemo(() => {
    if (tab === "all") return sellers;
    return sellers.filter((s) => s.category === tab);
  }, [sellers, tab]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Vendeurs actifs" value={formatNum(stats.active)} icon={Users} accent="primary" />
        <StatCard label="Nouveaux cette semaine" value={formatNum(stats.newWeek)} icon={UserPlus} accent="success" />
        <StatCard label="Note moyenne" value={`${stats.avgRating.toFixed(1)} / 5`} icon={Star} accent="warning" />
        <StatCard label="Abonnés premium" value={formatNum(stats.premiums)} icon={Sparkles} accent="secondary" />
      </div>

      <div className="frost mt-4 flex items-center justify-between rounded-md p-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="faitMaison">Fait Maison</TabsTrigger>
            <TabsTrigger value="traiteur">Traiteur</TabsTrigger>
            <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="text-xs text-on-surface-variant">{filtered.length} vendeurs</span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s)}
            className="group flex flex-col gap-3 rounded-md border border-outline-variant bg-surface-container-low p-4 text-left transition-colors hover:border-outline hover:bg-surface-container-high/40"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={s.avatar} alt={s.name} />
                <AvatarFallback>
                  {s.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[14px] font-semibold text-on-surface">{s.name}</h3>
                <div className="mt-0.5 text-[11px] text-on-surface-variant">{s.city}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <CategoryBadge category={s.category} />
                  {s.subscriptionTier === "premium" && (
                    <Badge variant="secondary">
                      <Sparkles className="mr-1 h-3 w-3" /> Premium
                    </Badge>
                  )}
                  {s.subscriptionTier === "standard" && <Badge variant="info">Standard</Badge>}
                </div>
              </div>
              {s.hygieneOk ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-success/15 text-success" title="Hygiène 100%">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-error/15 text-error" title="Hygiène signalée">
                  <ShieldAlert className="h-3.5 w-3.5" />
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-outline-variant/60 pt-3">
              <Mini label="Note" value={`${s.rating}`} icon={<Star className="h-3 w-3 fill-current text-warning" />} sub={`${s.ratingCount} avis`} />
              <Mini label="Ventes" value={formatNum(s.totalSales)} sub="à ce jour" />
              <Mini label="CA" value={formatEur(s.totalRevenue)} sub="total" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {s.activeListings} annonce{s.activeListings > 1 ? "s" : ""}
              </span>
              <span>Membre {relativeTimeFr(s.joined)}</span>
            </div>
          </button>
        ))}
      </div>

      <SellerDrawer seller={active} onClose={() => setActive(null)} />
    </>
  );
}

function Mini({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold tabular-nums text-on-surface">
        {icon}
        {value}
      </div>
      {sub && <div className="text-[10px] text-on-surface-variant">{sub}</div>}
    </div>
  );
}
