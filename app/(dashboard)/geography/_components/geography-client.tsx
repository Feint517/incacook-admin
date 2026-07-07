"use client";

/**
 * Geography (France map) — client data layer.
 *
 * Fetches the real per-city aggregates from `GET /v1/admin/dashboard/cities`
 * through `useAdminQuery` (admin bearer + 401 refresh handled for us) and feeds
 * the Leaflet map + ranking panel.
 *
 * IMPORTANT — the endpoint returns `{ city, orderCount, revenueCents }` with NO
 * coordinates and NO seller/buyer/driver split. So:
 *   - Only two real metrics are offered: Commandes and Revenu.
 *   - Coordinates are resolved client-side via `coordsFor()` (see
 *     `city-coords.ts`). Cities without a coordinate match are dropped from the
 *     map but still counted and listed (flagged "hors carte").
 */

import { useMemo, useState } from "react";
import { FranceHeatmap, type MapPoint } from "@/components/dashboard/france-map";
import { Card } from "@/components/ui/card";
import { DataTableError } from "@/components/dashboard/data-table-states";
import { useAdminQuery } from "@/lib/query";
import { cn, formatEur, formatNum } from "@/lib/utils";
import { coordsFor } from "./city-coords";

// ---- response shape (mirrors the server DTO; kept local per task scope) -----

interface CityRow {
  city: string;
  orderCount: number;
  revenueCents: number;
}

// ---- metric + period selectors ---------------------------------------------

const METRICS = [
  { key: "orders" as const, label: "Commandes" },
  { key: "revenue" as const, label: "Revenu" },
];
type MetricKey = (typeof METRICS)[number]["key"];

const PERIODS = [
  { key: "today", label: "Aujourd'hui" },
  { key: "last7Days", label: "7 jours" },
  { key: "last30Days", label: "30 jours" },
  { key: "all", label: "Tout" },
] as const;
type PeriodKey = (typeof PERIODS)[number]["key"];

/** Metric value pulled from a real city row. */
function metricValue(row: CityRow, metric: MetricKey): number {
  return metric === "revenue" ? row.revenueCents / 100 : row.orderCount;
}

/** Format a metric value for display. */
function metricLabel(value: number, metric: MetricKey): string {
  return metric === "revenue" ? formatEur(value) : formatNum(value);
}

export function GeographyClient() {
  const [metric, setMetric] = useState<MetricKey>("orders");
  const [period, setPeriod] = useState<PeriodKey>("last30Days");
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const citiesQ = useAdminQuery<CityRow[]>({
    path: "/admin/dashboard/cities",
    params: { extra: { range: period } },
  });

  const rows = citiesQ.data ?? [];
  const metricInfo = METRICS.find((m) => m.key === metric)!;

  // Rank all cities by the selected metric (matched + unmatched on the map).
  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) => metricValue(b, metric) - metricValue(a, metric),
      ),
    [rows, metric],
  );

  // Only cities with a coordinate match land on the map.
  const points: MapPoint[] = useMemo(
    () =>
      rows.flatMap((row) => {
        const c = coordsFor(row.city);
        if (!c) return [];
        return [
          {
            city: row.city,
            lat: c.lat,
            lng: c.lng,
            weight: metricValue(row, metric),
            details: {
              Commandes: formatNum(row.orderCount),
              Revenu: formatEur(row.revenueCents / 100),
            },
          },
        ];
      }),
    [rows, metric],
  );

  const unmatchedCount = rows.length - points.length;
  const active = activeCity
    ? rows.find((r) => r.city === activeCity) ?? null
    : null;
  const activeOnMap = active ? coordsFor(active.city) != null : false;
  const maxValue = sorted.length ? metricValue(sorted[0], metric) : 0;

  // ---- states --------------------------------------------------------------

  if (citiesQ.isError) {
    return <DataTableError error={citiesQ.error} onRetry={citiesQ.refetch} />;
  }

  return (
    <div className="space-y-3">
      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-1.5">
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

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
        <Card className="relative overflow-hidden p-3">
          <div className="frost absolute left-5 top-5 z-[400] flex items-center gap-1 rounded-full p-1">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                  metric === m.key
                    ? "bg-primary text-primary-foreground"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {citiesQ.isLoading && !citiesQ.data ? (
            <div className="flex h-[620px] w-full animate-pulse items-center justify-center rounded-md bg-surface-container-low text-xs text-on-surface-variant">
              Chargement des données…
            </div>
          ) : points.length === 0 ? (
            <div className="flex h-[620px] w-full flex-col items-center justify-center gap-2 rounded-md bg-surface-container-low text-center">
              <p className="text-sm font-medium text-on-surface">
                Aucune ville à afficher
              </p>
              <p className="max-w-[280px] text-xs text-on-surface-variant">
                {rows.length === 0
                  ? "Aucune commande sur cette période."
                  : `${rows.length} ville(s) sans coordonnées connues — visibles dans le classement.`}
              </p>
            </div>
          ) : (
            <FranceHeatmap height={620} metric={metricInfo.label} points={points} />
          )}

          {unmatchedCount > 0 && points.length > 0 && (
            <p className="mt-2 text-[10.5px] text-on-surface-variant">
              {unmatchedCount} ville(s) sans coordonnées connues, non affichée(s)
              sur la carte.
            </p>
          )}
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="p-3">
            <h3 className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Classement par {metricInfo.label.toLowerCase()}
            </h3>
            <div className="mt-2 max-h-[520px] overflow-y-auto pr-1">
              {citiesQ.isLoading && !citiesQ.data ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="mb-1.5 h-9 animate-pulse rounded-md bg-surface-container-low"
                  />
                ))
              ) : sorted.length === 0 ? (
                <p className="py-6 text-center text-xs text-on-surface-variant">
                  Aucune donnée.
                </p>
              ) : (
                sorted.map((c, i) => {
                  const v = metricValue(c, metric);
                  const pct = maxValue ? (v / maxValue) * 100 : 0;
                  const onMap = coordsFor(c.city) != null;
                  return (
                    <button
                      key={c.city}
                      onClick={() => setActiveCity(c.city)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-container-high",
                        activeCity === c.city && "bg-surface-container-high",
                      )}
                    >
                      <span className="w-6 text-[10.5px] tabular-nums text-on-surface-variant">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 text-[12px]">
                          <span className="flex min-w-0 items-center gap-1 truncate font-medium text-on-surface">
                            <span className="truncate">{c.city}</span>
                            {!onMap && (
                              <span className="shrink-0 text-[9px] uppercase tracking-wide text-on-surface-variant">
                                hors carte
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums">
                            {metricLabel(v, metric)}
                          </span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-container-high">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {active && (
            <Card className="p-4">
              <h3 className="text-base font-semibold text-on-surface">
                {active.city}
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                {activeOnMap ? "Détail de la ville" : "Ville hors carte (coordonnées inconnues)"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Mini label="Commandes" value={formatNum(active.orderCount)} />
                <Mini label="Revenus" value={formatEur(active.revenueCents / 100)} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-container-low p-2">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-on-surface">
        {value}
      </div>
    </div>
  );
}
