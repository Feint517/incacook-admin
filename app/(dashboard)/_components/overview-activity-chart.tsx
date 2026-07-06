"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { cn, formatEur } from "@/lib/utils";

/** One bar in the revenue breakdown chart. `revenue` is in euros. */
export interface BreakdownDatum {
  label: string;
  revenue: number;
  orders: number;
}

const VIEWS = [
  { key: "category", label: "Par catégorie" },
  { key: "city", label: "Par ville" },
] as const;
type ViewKey = (typeof VIEWS)[number]["key"];

const BAR_COLOR = "#00C263";

/**
 * Revenue breakdown bar chart for the overview. The admin backend exposes no
 * per-day time series, so this renders paid revenue split by seller category
 * (`/admin/dashboard/categories`) or by delivery city
 * (`/admin/dashboard/cities`), toggled from the header.
 */
export function OverviewActivityChart({
  byCategory,
  byCity,
}: {
  byCategory: BreakdownDatum[];
  byCity: BreakdownDatum[];
}) {
  const [view, setView] = useState<ViewKey>("category");
  const data = view === "category" ? byCategory : byCity;
  const hasData = data.some((d) => d.revenue > 0 || d.orders > 0);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Revenus par répartition</CardTitle>
          <p className="mt-1 text-xs text-on-surface-variant">
            Revenu payé (EUR) sur la période sélectionnée
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VIEWS.map((v) => {
            const isOn = view === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide transition-colors",
                  isOn
                    ? "border-outline-variant bg-surface-container-high text-on-surface"
                    : "border-outline-variant/50 text-on-surface-variant",
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: isOn ? BAR_COLOR : "var(--outline)" }}
                />
                {v.label}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }}
                  width={48}
                  tickFormatter={(v: number) => formatEur(v)}
                />
                <RTooltip
                  cursor={{ fill: "var(--surface-container-high)", opacity: 0.4 }}
                  content={
                    <ChartTooltip
                      formatter={(value, name) =>
                        name === "Revenu" ? formatEur(value) : String(value)
                      }
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  name="Revenu"
                  fill={BAR_COLOR}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={72}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">
              Aucune donnée pour cette période
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
