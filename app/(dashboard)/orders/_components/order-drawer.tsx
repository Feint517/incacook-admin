"use client";

import { Drawer } from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/dashboard/status-badge";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Store, MapPin, Calendar } from "lucide-react";
import { formatEur, formatDateTimeFr } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/mock-data/types";
import { cn } from "@/lib/utils";

const TIMELINE_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "new", label: "Commande créée" },
  { key: "accepted", label: "Acceptée par le vendeur" },
  { key: "preparing", label: "En préparation" },
  { key: "ready", label: "Prête" },
  { key: "delivering", label: "En livraison" },
  { key: "completed", label: "Livrée" },
];

function statusIndex(s: OrderStatus) {
  return TIMELINE_STEPS.findIndex((t) => t.key === s);
}

export function OrderDrawer({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  if (!order) return null;
  const idx = order.status === "cancelled" ? -1 : statusIndex(order.status);
  const subtotal = order.total * 0.85;
  const deliveryFee = order.fulfillment === "delivery" ? order.total * 0.1 : 0;
  const commission = order.total * 0.28;

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <div>
          <p className="font-mono text-[11px] text-on-surface-variant">{order.id}</p>
          <h3 className="mt-1 text-lg font-semibold text-on-surface">
            Commande de {formatEur(order.total, { cents: true })}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <OrderStatusBadge status={order.status} />
            <CategoryBadge category={order.category} />
            <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
              {order.fulfillment === "delivery" ? <Truck className="h-3 w-3" /> : <Store className="h-3 w-3" />}
              {order.fulfillment === "delivery" ? "Livraison" : "Retrait"}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-sm">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">{formatDateTimeFr(order.date)}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-on-surface-variant">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">{order.city}</span>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Suivi de commande
          </h4>
          <ol className="relative ml-2 space-y-3 border-l border-outline-variant pl-5">
            {TIMELINE_STEPS.map((step, i) => {
              const done = order.status !== "cancelled" && i <= idx;
              const isCurrent = i === idx;
              return (
                <li key={step.key} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[27px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-surface",
                      done ? "bg-primary" : "bg-surface-container-high",
                      isCurrent && "ring-2 ring-primary/30",
                    )}
                  />
                  <p
                    className={cn(
                      "text-[13px]",
                      done ? "font-medium text-on-surface" : "text-on-surface-variant",
                    )}
                  >
                    {step.label}
                  </p>
                </li>
              );
            })}
            {order.status === "cancelled" && (
              <li className="relative">
                <span className="absolute -left-[27px] top-0.5 h-3 w-3 rounded-full bg-error border-2 border-surface" />
                <p className="text-[13px] font-medium text-error">Commande annulée</p>
              </li>
            )}
          </ol>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-2">
          <Card title="Acheteur" name={order.buyerName} role="Acheteur" />
          <Card title="Vendeur" name={order.sellerName} role="Vendeur" />
          <Card
            title="Livreur"
            name={order.driverName || "—"}
            role={order.driverName ? "Livreur" : "Aucun"}
            muted={!order.driverName}
          />
        </div>

        <div>
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Articles
          </h4>
          <div className="space-y-1.5">
            {Array.from({ length: order.itemCount }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border border-outline-variant/40 bg-surface px-3 py-2 text-[13px]"
              >
                <span className="text-on-surface">Article {i + 1}</span>
                <span className="font-medium tabular-nums">
                  {formatEur(order.total / order.itemCount * 0.85, { cents: true })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px]">
          <Row label="Sous-total" value={formatEur(subtotal, { cents: true })} />
          <Row label="Frais de livraison" value={formatEur(deliveryFee, { cents: true })} />
          <Row label="Commission plateforme" value={formatEur(commission, { cents: true })} muted />
          <Separator />
          <Row label="Total payé" value={formatEur(order.total, { cents: true })} bold />
        </div>
      </div>
    </Drawer>
  );
}

function Card({ title, name, role, muted }: { title: string; name: string; role: string; muted?: boolean }) {
  return (
    <div className={cn("rounded-md border border-outline-variant bg-surface-container-low p-2.5", muted && "opacity-60")}>
      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{title}</p>
      <p className="mt-1 truncate text-[12px] font-medium text-on-surface">{name}</p>
      <p className="text-[10.5px] text-on-surface-variant">{role}</p>
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", muted && "text-on-surface-variant")}>
      <span>{label}</span>
      <span className={cn("tabular-nums", bold && "font-semibold")}>{value}</span>
    </div>
  );
}
