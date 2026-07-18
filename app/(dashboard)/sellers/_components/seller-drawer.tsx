"use client";

import { Star } from "lucide-react";
import { Drawer, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatEur, formatNum, formatDateFr } from "@/lib/utils";
import { ConnectReadinessBadge } from "@/components/dashboard/status-badge";
import {
  SellerCategoryBadge,
  SellerStatus,
  SellerTierBadge,
  initialsOf,
  type AdminSeller,
} from "./seller-model";

/** Human labels for the raw subscription status enum. */
const SUB_STATUS_LABEL: Record<AdminSeller["subscriptionStatus"], string> = {
  NONE: "Aucun",
  ACTIVE: "Actif",
  TRIALING: "Essai",
  PAST_DUE: "Impayé (en retard)",
  CANCELED: "Annulé",
  EXPIRED: "Expiré",
  UNPAID: "Impayé",
  INCOMPLETE: "Incomplet",
  INCOMPLETE_EXPIRED: "Incomplet (expiré)",
};

/**
 * Seller detail drawer. Renders entirely from the list row — there is no
 * `GET /v1/admin/sellers/:id`, so no extra fetch. Fields the endpoint does not
 * expose (hygiene / quality / packaging scores, per-month sales, reviews) are
 * intentionally absent rather than fabricated. Stripe Connect readiness
 * (issue #12) was one such absence until the backend added it — no longer
 * missing.
 */
export function SellerDrawer({
  seller,
  onClose,
}: {
  seller: AdminSeller | null;
  onClose: () => void;
}) {
  if (!seller) return null;

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{initialsOf(seller.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-base">{seller.name}</DialogTitle>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <SellerCategoryBadge category={seller.category} />
              <SellerTierBadge tier={seller.subscriptionTier} />
              <SellerStatus seller={seller} />
            </div>
            <p className="mt-1 text-[12px] text-on-surface-variant">
              {seller.email} · membre depuis {formatDateFr(seller.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Mini label="Ventes" value={formatNum(seller.totalSales)} sub="à ce jour" />
          <Mini
            label="Revenus"
            value={formatEur(seller.totalRevenueCents / 100)}
            sub="total"
          />
          <Mini
            label="Note"
            value={seller.rating != null ? seller.rating.toFixed(1) : "—"}
            icon={<Star className="h-3 w-3 fill-current text-warning" />}
            sub={`${formatNum(seller.ratingCount)} avis`}
          />
        </div>

        <Separator />

        <div>
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Détails
          </h4>
          <div className="space-y-1.5">
            <Row label="Annonces actives" value={formatNum(seller.activeListings)} />
            <Row
              label="Abonnement"
              value={SUB_STATUS_LABEL[seller.subscriptionStatus] ?? seller.subscriptionStatus}
            />
            <Row
              label="Stripe Connect"
              value={
                <ConnectReadinessBadge
                  stripeDetailsSubmitted={seller.stripeDetailsSubmitted}
                  stripePayoutsEnabled={seller.stripePayoutsEnabled}
                />
              }
            />
            <Row label="Identifiant" value={seller.id} mono />
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function Mini({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-surface-container-low p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
        {label}
      </div>
      <div className="mt-0.5 flex items-center gap-1 text-[14px] font-semibold tabular-nums text-on-surface">
        {icon}
        {value}
      </div>
      {sub && <div className="text-[10px] text-on-surface-variant">{sub}</div>}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-surface-container-low px-3 py-2">
      <span className="text-[13px] text-on-surface-variant">{label}</span>
      <span
        className={
          mono
            ? "truncate text-[11px] tabular-nums text-on-surface-variant"
            : "text-[13px] font-medium text-on-surface"
        }
      >
        {value}
      </span>
    </div>
  );
}
