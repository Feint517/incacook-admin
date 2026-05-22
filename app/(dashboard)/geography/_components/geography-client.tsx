"use client";

import { useMemo, useState } from "react";
import { FranceHeatmap } from "@/components/dashboard/france-map";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn, formatEur, formatNum } from "@/lib/utils";
import type { CityStat } from "@/lib/mock-data/types";

const METRICS = [
  { key: "orders" as const, label: "Commandes" },
  { key: "sellers" as const, label: "Vendeurs" },
  { key: "buyers" as const, label: "Acheteurs" },
  { key: "drivers" as const, label: "Livreurs" },
];

export function GeographyClient({ cities }: { cities: CityStat[] }) {
  const [metric, setMetric] = useState<typeof METRICS[number]["key"]>("orders");
  const [active, setActive] = useState<CityStat | null>(null);

  const sorted = useMemo(
    () => [...cities].sort((a, b) => (b[metric] as number) - (a[metric] as number)),
    [cities, metric],
  );

  const points = useMemo(
    () =>
      cities.map((c) => ({
        city: c.city,
        lat: c.lat,
        lng: c.lng,
        weight: c[metric] as number,
      })),
    [cities, metric],
  );

  return (
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
        <FranceHeatmap
          height={620}
          metric={METRICS.find((m) => m.key === metric)!.label}
          points={points}
        />
      </Card>

      <div className="flex flex-col gap-3">
        <Card className="p-3">
          <h3 className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Classement par {METRICS.find((m) => m.key === metric)!.label.toLowerCase()}
          </h3>
          <div className="mt-2 max-h-[280px] overflow-y-auto pr-1">
            {sorted.map((c, i) => {
              const max = sorted[0][metric] as number;
              const v = c[metric] as number;
              const pct = max ? (v / max) * 100 : 0;
              return (
                <button
                  key={c.city}
                  onClick={() => setActive(c)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-container-high",
                    active?.city === c.city && "bg-surface-container-high",
                  )}
                >
                  <span className="w-6 text-[10.5px] tabular-nums text-on-surface-variant">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="truncate font-medium text-on-surface">{c.city}</span>
                      <span className="font-semibold tabular-nums">{formatNum(v)}</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {active && (
          <Card className="p-4">
            <h3 className="text-base font-semibold text-on-surface">{active.city}</h3>
            <p className="text-[11px] text-on-surface-variant">Détail de la ville</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Mini label="Commandes" value={formatNum(active.orders)} />
              <Mini label="Vendeurs" value={formatNum(active.sellers)} />
              <Mini label="Acheteurs" value={formatNum(active.buyers)} />
              <Mini label="Livreurs" value={formatNum(active.drivers)} />
            </div>
            <div className="mt-3 rounded-md bg-surface-container-low p-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-on-surface-variant">Revenus totaux</span>
                <span className="font-semibold tabular-nums text-on-surface">{formatEur(active.revenue)}</span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Tendance 14 j</p>
              <div className="mt-1 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={Array.from({ length: 14 }, (_, i) => ({
                      v: Math.max(0, active.orders / 14 + Math.sin(i / 2) * 4 + (i - 7) * 0.4),
                    }))}
                  >
                    <defs>
                      <linearGradient id="city-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00C263" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#00C263" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#00C263"
                      strokeWidth={2}
                      fill="url(#city-grad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-container-low p-2">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-on-surface">{value}</div>
    </div>
  );
}
