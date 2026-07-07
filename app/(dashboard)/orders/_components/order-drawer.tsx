"use client";

import { Drawer, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Truck, Store, MapPin, Calendar, Package } from "lucide-react";
import { formatEur, formatDateTimeFr } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  cityLabel,
  OrderCategoryBadge,
  OrderStatusBadge,
  ORDER_STATUS_LABEL,
  toEuros,
  type AdminOrder,
  type OrderStatus,
} from "./order-model";

/** Happy-path progression, in order. Rank drives which steps read as "done". */
const STATUS_RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY: 3,
  PICKED_UP: 4,
  IN_DELIVERY: 5,
  DELIVERED: 6,
  COMPLETED: 7,
  // Exception states — no linear progress.
  NO_DRIVER_AVAILABLE: -1,
  CANCELLED: -1,
  REFUNDED: -1,
  DISPUTED: -1,
};

/** Steps shown in the timeline for a delivery order (pickup drops delivery-only steps). */
const DELIVERY_ONLY: OrderStatus[] = ["PICKED_UP", "IN_DELIVERY"];
const TIMELINE: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "PICKED_UP",
  "IN_DELIVERY",
  "DELIVERED",
  "COMPLETED",
];

export function OrderDrawer({
  order,
  onClose,
}: {
  order: AdminOrder | null;
  onClose: () => void;
}) {
  if (!order) return null;

  const rank = STATUS_RANK[order.status];
  const isException = rank < 0;
  const steps = TIMELINE.filter(
    (s) => order.fulfillment === "delivery" || !DELIVERY_ONLY.includes(s),
  );

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <div>
          <p className="font-mono text-[11px] text-on-surface-variant">
            {order.orderNumber}
          </p>
          <DialogTitle className="mt-1 text-lg font-semibold text-on-surface">
            Commande de {formatEur(toEuros(order.totalCents), { cents: true })}
          </DialogTitle>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <OrderStatusBadge status={order.status} />
            <OrderCategoryBadge category={order.category} />
            <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
              {order.fulfillment === "delivery" ? (
                <Truck className="h-3 w-3" />
              ) : (
                <Store className="h-3 w-3" />
              )}
              {order.fulfillment === "delivery" ? "Livraison" : "Retrait"}
            </span>
          </div>
        </div>

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-sm">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">
              {formatDateTimeFr(order.createdAt)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-on-surface-variant">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">{cityLabel(order)}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-on-surface-variant">
            <Package className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">
              {order.itemCount} article{order.itemCount > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Suivi de commande
          </h4>
          <ol className="relative ml-2 space-y-3 border-l border-outline-variant pl-5">
            {steps.map((step) => {
              const stepRank = STATUS_RANK[step];
              const done = !isException && rank >= stepRank;
              const isCurrent = !isException && rank === stepRank;
              return (
                <li key={step} className="relative">
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
                      done
                        ? "font-medium text-on-surface"
                        : "text-on-surface-variant",
                    )}
                  >
                    {ORDER_STATUS_LABEL[step]}
                  </p>
                </li>
              );
            })}
            {isException && (
              <li className="relative">
                <span className="absolute -left-[27px] top-0.5 h-3 w-3 rounded-full bg-error border-2 border-surface" />
                <p className="text-[13px] font-medium text-error">
                  {ORDER_STATUS_LABEL[order.status]}
                </p>
              </li>
            )}
          </ol>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-2">
          <Card title="Acheteur" name={order.buyer.name || "—"} role="Acheteur" />
          <Card title="Vendeur" name={order.seller.name || "—"} role="Vendeur" />
          <Card
            title="Livreur"
            name={order.driver?.name || "—"}
            role={order.driver ? "Livreur" : "Aucun"}
            muted={!order.driver}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px]">
          <span className="text-on-surface-variant">Total payé</span>
          <span className="font-semibold tabular-nums">
            {formatEur(toEuros(order.totalCents), { cents: true })}
          </span>
        </div>
      </div>
    </Drawer>
  );
}

function Card({
  title,
  name,
  role,
  muted,
}: {
  title: string;
  name: string;
  role: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-outline-variant bg-surface-container-low p-2.5",
        muted && "opacity-60",
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
        {title}
      </p>
      <p className="mt-1 truncate text-[12px] font-medium text-on-surface">
        {name}
      </p>
      <p className="text-[10.5px] text-on-surface-variant">{role}</p>
    </div>
  );
}
