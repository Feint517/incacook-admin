"use client";

import { Drawer } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import { UserStatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { ChartTooltip } from "@/components/dashboard/chart-tooltip";
import { CheckCircle2, Sparkles, Star, XCircle } from "lucide-react";
import { formatEur, formatNum, formatDateFr } from "@/lib/utils";
import type { Seller } from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";

const SAMPLE_REVIEWS = [
  { author: "Marie L.", rating: 5, comment: "Tajine absolument délicieux, retour comme chez ma grand-mère !" },
  { author: "Lucas P.", rating: 4, comment: "Très bon, juste un peu froid à la livraison." },
  { author: "Inès B.", rating: 5, comment: "Portions généreuses, accueil super sympa." },
  { author: "Karim D.", rating: 4, comment: "Bonne cuisine maison, je recommande." },
];

export function SellerDrawer({ seller, onClose }: { seller: Seller | null; onClose: () => void }) {
  if (!seller) return null;

  const salesSeries = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2025, 5 + i, 1).toLocaleDateString("fr-FR", { month: "short" }),
    sales: Math.max(0, Math.round(seller.totalSales / 14 + Math.sin(i / 2) * 6 + (i - 6) * 1.5)),
    revenue: Math.max(0, Math.round(seller.totalRevenue / 14 + Math.cos(i / 2) * 30 + (i - 6) * 7)),
  }));

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback>{seller.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-on-surface">{seller.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <CategoryBadge category={seller.category} />
              <UserStatusBadge status={seller.status} />
              {seller.subscriptionTier === "premium" && (
                <Badge variant="secondary">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="mt-1 text-[12px] text-on-surface-variant">
              {seller.email} · {seller.city} · membre depuis {formatDateFr(seller.joined)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Mini label="Ventes" value={formatNum(seller.totalSales)} />
          <Mini label="Revenus" value={formatEur(seller.totalRevenue)} />
          <Mini
            label="Note"
            value={`${seller.rating}`}
            icon={<Star className="h-3 w-3 fill-current text-warning" />}
            sub={`${seller.ratingCount} avis`}
          />
        </div>

        <div>
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Vérifications
          </h4>
          <div className="space-y-1.5">
            <CheckRow ok={!!seller.idVerified} label="Pièce d'identité" />
            <CheckRow ok={!!seller.charterSigned} label="Charte signée" />
            <CheckRow ok={seller.hygieneOk} label="Hygiène conforme" />
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Performance
          </h4>
          <div className="space-y-2">
            <Bar label="Hygiène" value={seller.hygieneOk ? 100 : 50} variant={seller.hygieneOk ? "success" : "error"} />
            <Bar label="Qualité du plat" value={(seller.qualityScore / 5) * 100} sub={`${seller.qualityScore} / 5`} />
            <Bar label="Emballage" value={(seller.packagingScore / 5) * 100} sub={`${seller.packagingScore} / 5`} />
          </div>
        </div>

        <Separator />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Évolution des ventes
            </h4>
            <span className="text-[10px] text-on-surface-variant">12 derniers mois</span>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sales-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00C263" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00C263" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }} interval={1} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }} width={28} />
                <RTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="Ventes"
                  stroke="#00C263"
                  strokeWidth={2}
                  fill="url(#sales-grad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Avis clients récents
          </h4>
          <div className="space-y-2">
            {SAMPLE_REVIEWS.map((r, i) => (
              <div key={i} className="rounded-md border border-outline-variant/40 bg-surface px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-on-surface">{r.author}</span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={cn("h-3 w-3", j < r.rating ? "fill-warning text-warning" : "text-outline-variant")}
                      />
                    ))}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-on-surface-variant">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-surface-container-low px-3 py-2">
      <span className="text-[13px] text-on-surface">{label}</span>
      {ok ? (
        <Badge variant="success">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Validé
        </Badge>
      ) : (
        <Badge variant="warning">
          <XCircle className="mr-1 h-3 w-3" /> En attente
        </Badge>
      )}
    </div>
  );
}

function Mini({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md bg-surface-container-low p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className="mt-0.5 flex items-center gap-1 text-[14px] font-semibold tabular-nums text-on-surface">
        {icon}
        {value}
      </div>
      {sub && <div className="text-[10px] text-on-surface-variant">{sub}</div>}
    </div>
  );
}

function Bar({
  label,
  value,
  sub,
  variant = "primary",
}: {
  label: string;
  value: number;
  sub?: string;
  variant?: "primary" | "success" | "error";
}) {
  const color = variant === "primary" ? "bg-primary" : variant === "success" ? "bg-success" : "bg-error";
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-medium text-on-surface">{sub ?? `${value.toFixed(0)}%`}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
