"use client";

import { ResponsiveContainer, Area, AreaChart } from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, formatPercent } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  trend?: { v: number }[];
  accent?: "primary" | "secondary" | "success" | "info" | "warning";
  emoji?: string;
}

const ACCENT_HEX: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  primary: "#00C263",
  secondary: "#C8553D",
  success: "#0E8E4E",
  info: "#2196F3",
  warning: "#FFC107",
};

export function KpiCard({ label, value, delta, trend, accent = "primary", emoji }: KpiCardProps) {
  const color = ACCENT_HEX[accent];
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-low p-4">
      <div className="flex items-start justify-between">
        <p className="text-[10.5px] font-medium uppercase tracking-wider text-on-surface-variant">
          {label}
        </p>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
              positive ? "bg-success/15 text-success" : "bg-error/15 text-error",
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {formatPercent(delta)}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[28px] font-bold leading-none tabular-nums text-on-surface">{value}</span>
        {emoji && <span className="text-base">{emoji}</span>}
      </div>
      {trend && trend.length > 0 && (
        <div className="mt-3 h-10 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#grad-${label})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
