"use client";

import { Drawer, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Truck, Store, MapPin, Calendar, Package, Wallet, AlertTriangle } from "lucide-react";
import { formatEurFromCents, formatDateTimeFr } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAdminQuery } from "@/lib/query";
import {
  cityLabel,
  OrderCategoryBadge,
  OrderStatusBadge,
  ORDER_STATUS_LABEL,
  type AdminOrder,
  type OrderStatus,
} from "./order-model";

/** Money split + wallet ledger from GET /v1/admin/orders/:id/financials. */
interface WalletEntry {
  userId: string;
  type: string;
  amountCents: number;
  status: string;
  withdrawalId: string | null;
  transferId: string | null;
}
/** Arithmetic cross-check (issue #21) — a broken commission/earnings/fee
 *  split used to render as a clean panel of independent numbers with no
 *  way to catch it. See IncaCook-Server's wallets.service.ts for the
 *  three checks this combines. */
interface OrderFinancialsReconciliation {
  isReconciled: boolean;
  pricingSplitDeltaCents: number;
  subtotalSplitDeltaCents: number;
  ledgerBookingDeltaCents: number | null;
  reversalInconsistent: boolean;
}
interface OrderFinancials {
  order: {
    id: string;
    status: string;
    buyerTotalCents: number | null;
    subtotalCents: number | null;
    fulfillmentFeeCents: number | null;
    commissionCents: number | null;
    sellerEarningsCents: number | null;
    driverEarningsCents?: number | null;
  };
  walletEntries: WalletEntry[];
  reconciliation: OrderFinancialsReconciliation;
}

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
  // Money split is fetched lazily when the drawer opens (admin-only endpoint).
  const financials = useAdminQuery<OrderFinancials>({
    path: order ? `/admin/orders/${order.id}/financials` : "/admin/orders/none/financials",
    enabled: !!order,
  });

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
            Commande de {formatEurFromCents(order.totalCents)}
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

        <Separator />

        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            <Wallet className="h-3.5 w-3.5" /> Répartition financière
          </h4>
          {financials.isLoading ? (
            <div className="h-24 animate-pulse rounded-md bg-surface-container-low" />
          ) : financials.data ? (
            <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px]">
              {!financials.data.reconciliation.isReconciled && (
                <ReconciliationWarning reconciliation={financials.data.reconciliation} />
              )}
              <Money label="Sous-total" cents={financials.data.order.subtotalCents} />
              <Money label="Frais de livraison" cents={financials.data.order.fulfillmentFeeCents} />
              <Money label="Commission plateforme" cents={financials.data.order.commissionCents} negative />
              <Money label="Revenu vendeur" cents={financials.data.order.sellerEarningsCents} />
              {financials.data.order.driverEarningsCents != null && (
                <Money label="Revenu livreur" cents={financials.data.order.driverEarningsCents} />
              )}
              <Separator className="my-2" />
              <Money label="Total payé" cents={financials.data.order.buyerTotalCents ?? order.totalCents} strong />

              {financials.data.walletEntries.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[10px] uppercase tracking-wider text-on-surface-variant">
                    Écritures portefeuille
                  </p>
                  <ul className="space-y-1">
                    {financials.data.walletEntries.map((e, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 text-[12px]">
                        <span className="truncate text-on-surface-variant">
                          {e.type}
                          <span className="ml-1 text-[10px] opacity-70">{e.status}</span>
                        </span>
                        <span className="tabular-nums">
                          {formatEurFromCents(e.amountCents)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // Financials unavailable (e.g. pre-payment order) — fall back to the total.
            <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px]">
              <span className="text-on-surface-variant">Total payé</span>
              <span className="font-semibold tabular-nums">
                {formatEurFromCents(order.totalCents)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

/** Prominent, not silent (issue #21) — a broken split used to be
 *  indistinguishable from a correct one. Lists exactly which check(s)
 *  failed and the delta, so an admin doesn't have to do the arithmetic
 *  themselves to notice something's wrong. */
function ReconciliationWarning({
  reconciliation,
}: {
  reconciliation: OrderFinancialsReconciliation;
}) {
  const problems: string[] = [];
  if (reconciliation.pricingSplitDeltaCents !== 0) {
    problems.push(
      `Écart de répartition du prix : ${formatEurFromCents(reconciliation.pricingSplitDeltaCents)}`,
    );
  }
  if (reconciliation.subtotalSplitDeltaCents !== 0) {
    problems.push(
      `Écart commission/revenu vendeur : ${formatEurFromCents(reconciliation.subtotalSplitDeltaCents)}`,
    );
  }
  if (
    reconciliation.ledgerBookingDeltaCents != null &&
    reconciliation.ledgerBookingDeltaCents !== 0
  ) {
    problems.push(
      `Écart portefeuille : ${formatEurFromCents(reconciliation.ledgerBookingDeltaCents)}`,
    );
  }
  if (reconciliation.reversalInconsistent) {
    problems.push(
      "Écritures d'annulation incohérentes : certaines lignes ont été annulées, d'autres non.",
    );
  }

  return (
    <div className="mb-3 rounded-md border border-error/30 bg-error/10 p-3 text-[13px] text-error">
      <div className="flex items-center gap-1.5 font-semibold">
        <AlertTriangle className="h-3.5 w-3.5" />
        Répartition non réconciliée
      </div>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
        {problems.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

function Money({
  label,
  cents,
  negative,
  strong,
}: {
  label: string;
  cents: number | null;
  negative?: boolean;
  strong?: boolean;
}) {
  if (cents == null) return null;
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={cn("text-on-surface-variant", strong && "font-medium text-on-surface")}>
        {label}
      </span>
      <span className={cn("tabular-nums", strong && "font-semibold", negative && "text-on-surface-variant")}>
        {negative ? "−" : ""}
        {formatEurFromCents(cents)}
      </span>
    </div>
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
