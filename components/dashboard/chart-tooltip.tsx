"use client";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number, name: string) => string;
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-high px-3 py-2 text-xs shadow-md backdrop-blur">
      {label && <div className="mb-1 font-medium text-on-surface">{label}</div>}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 tabular-nums text-on-surface-variant">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span>{p.name}:</span>
            <span className="font-medium text-on-surface">
              {formatter ? formatter(p.value, p.name) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
