"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Tag, CalendarPlus, AlertTriangle, ChefHat } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ListingStatusBadge } from "@/components/dashboard/status-badge";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListingDrawer } from "./listing-drawer";
import { DietBadge, DishTypeBadge } from "@/components/dashboard/diet-badge";
import { formatEur, formatNum, relativeTimeFr } from "@/lib/utils";
import type { Listing } from "@/lib/mock-data/types";

interface Props {
  listings: Listing[];
  stats: { active: number; today: number; soldOutDay: number; avgPrices: { cat: string; avg: number }[] };
}

const CAT_LABEL: Record<string, string> = {
  faitMaison: "Fait Maison",
  traiteur: "Traiteur",
  restaurant: "Restaurant",
};

export function ListingsClient({ listings, stats }: Props) {
  const [category, setCategory] = useState("all");
  const [cuisine, setCuisine] = useState("all");
  const [diet, setDiet] = useState("all");
  const [dishType, setDishType] = useState("all");
  const [status, setStatus] = useState("all");
  const [hasReport, setHasReport] = useState("all");
  const [active, setActive] = useState<Listing | null>(null);

  const dishTypeApplies = category === "traiteur" || category === "restaurant";

  const filtered = useMemo(
    () =>
      listings.filter((l) => {
        if (category !== "all" && l.category !== category) return false;
        if (cuisine !== "all" && l.cuisine !== cuisine) return false;
        if (diet !== "all" && !l.diets.includes(diet as any)) return false;
        if (dishType !== "all" && l.dishType !== dishType) return false;
        if (status !== "all" && l.status !== status) return false;
        if (hasReport === "yes" && l.reportCount === 0) return false;
        if (hasReport === "no" && l.reportCount > 0) return false;
        return true;
      }),
    [listings, category, cuisine, diet, dishType, status, hasReport],
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Annonces actives" value={formatNum(stats.active)} icon={Tag} accent="primary" />
        <StatCard label="Publiées aujourd'hui" value={formatNum(stats.today)} icon={CalendarPlus} accent="info" />
        <StatCard label="Épuisées (24h)" value={formatNum(stats.soldOutDay)} icon={AlertTriangle} accent="warning" />
        <div className="rounded-md border border-outline-variant bg-surface-container-low p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-medium uppercase tracking-wider text-on-surface-variant">
              Prix moyen / catégorie
            </p>
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary/15 text-secondary">
              <ChefHat className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 space-y-0.5">
            {stats.avgPrices.map((p) => (
              <div key={p.cat} className="flex items-center justify-between text-[12px]">
                <span className="text-on-surface-variant">{CAT_LABEL[p.cat]}</span>
                <span className="font-semibold tabular-nums">{formatEur(p.avg, { cents: true })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="frost mt-4 flex flex-wrap items-center gap-2 rounded-md p-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            <SelectItem value="faitMaison">Fait Maison</SelectItem>
            <SelectItem value="traiteur">Traiteur</SelectItem>
            <SelectItem value="restaurant">Restaurant</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cuisine} onValueChange={setCuisine}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes cuisines</SelectItem>
            {["Orientale", "Française", "Africaine", "Portugaise", "Italienne", "Espagnole", "Latine"].map(
              (c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Select value={diet} onValueChange={setDiet}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Régime" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous régimes</SelectItem>
            {["Halal", "Végan", "Sans gluten", "Casher"].map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dishTypeApplies && (
          <Select value={dishType} onValueChange={setDishType}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Type de plat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="Entrée">Entrée</SelectItem>
              <SelectItem value="Plat">Plat</SelectItem>
              <SelectItem value="Desserts">Desserts</SelectItem>
              {category === "traiteur" && (
                <SelectItem value="Cocktail dinatoire">Cocktail dinatoire</SelectItem>
              )}
            </SelectContent>
          </Select>
        )}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="sold-out">Épuisées</SelectItem>
            <SelectItem value="paused">En pause</SelectItem>
            <SelectItem value="expired">Expirées</SelectItem>
          </SelectContent>
        </Select>
        <Select value={hasReport} onValueChange={setHasReport}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Signalements" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="yes">Avec signalement</SelectItem>
            <SelectItem value="no">Sans signalement</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-xs text-on-surface-variant">{filtered.length} annonces</span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.slice(0, 60).map((l) => {
          const stockPct = (l.portionsLeft / l.portionsTotal) * 100;
          return (
            <button
              key={l.id}
              onClick={() => setActive(l)}
              className="group flex flex-col overflow-hidden rounded-md border border-outline-variant bg-surface-container-low text-left transition-colors hover:border-outline"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-high">
                <Image
                  src={l.photo}
                  alt={l.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-2 top-2 flex items-center gap-1">
                  <ListingStatusBadge status={l.status} />
                </div>
                <div className="absolute right-2 top-2">
                  <span className="inline-flex items-center rounded-full bg-surface/85 px-2 py-0.5 text-[11px] font-semibold text-on-surface backdrop-blur">
                    {formatEur(l.price, { cents: true })}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                <h3 className="line-clamp-1 text-[13.5px] font-semibold text-on-surface">{l.title}</h3>
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span className="truncate">{l.sellerName}</span>
                  <CategoryBadge category={l.category} />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {l.dishType && <DishTypeBadge dish={l.dishType} />}
                  <span className="text-[10.5px] text-on-surface-variant">{l.cuisine}</span>
                </div>
                {l.diets.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {l.diets.map((d) => (
                      <DietBadge key={d} diet={d} />
                    ))}
                  </div>
                )}
                <div>
                  <div className="mb-0.5 flex justify-between text-[10.5px] text-on-surface-variant">
                    <span>
                      {l.portionsLeft}/{l.portionsTotal} portions
                    </span>
                    <span>{relativeTimeFr(l.expiresAt)}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <ListingDrawer listing={active} onClose={() => setActive(null)} />
    </>
  );
}
