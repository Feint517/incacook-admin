import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  accent?: "primary" | "secondary" | "info" | "warning" | "success" | "error";
  className?: string;
}

const ACCENT_BG: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  info: "bg-info/15 text-info",
  warning: "bg-warning/20 text-[#A07A00] dark:text-warning",
  success: "bg-success/15 text-success",
  error: "bg-error/15 text-error",
};

export function StatCard({ label, value, hint, icon: Icon, accent = "primary", className }: StatCardProps) {
  return (
    <div className={cn("rounded-md border border-outline-variant bg-surface-container-low p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10.5px] font-medium uppercase tracking-wider text-on-surface-variant">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md",
              ACCENT_BG[accent],
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums leading-none text-on-surface">{value}</p>
      {hint && <p className="mt-1.5 text-[11px] text-on-surface-variant">{hint}</p>}
    </div>
  );
}
