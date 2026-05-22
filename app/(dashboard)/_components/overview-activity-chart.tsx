"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { cn } from "@/lib/utils";

const SERIES = [
  { key: "orders", label: "Commandes", color: "#00C263" },
  { key: "users", label: "Nouveaux utilisateurs", color: "#2196F3" },
] as const;

export function OverviewActivityChart({ data }: { data: any[] }) {
  const [active, setActive] = useState<string[]>(["orders", "users"]);
  const toggle = (k: string) =>
    setActive((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Activité — 30 derniers jours</CardTitle>
          <p className="mt-1 text-xs text-on-surface-variant">Commandes, nouveaux utilisateurs et revenus</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SERIES.map((s) => {
            const isOn = active.includes(s.key);
            return (
              <button
                key={s.key}
                onClick={() => toggle(s.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide transition-colors",
                  isOn
                    ? "border-outline-variant bg-surface-container-high text-on-surface"
                    : "border-outline-variant/50 text-on-surface-variant",
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: isOn ? s.color : "var(--outline)" }}
                />
                {s.label}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }}
                interval={3}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }}
                width={40}
              />
              <RTooltip content={<ChartTooltip />} />
              {SERIES.map((s) =>
                active.includes(s.key) ? (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ) : null,
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
