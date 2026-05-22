"use client";

import { Drawer } from "@/components/ui/dialog";
import Image from "next/image";
import { ListingStatusBadge } from "@/components/dashboard/status-badge";
import { CategoryBadge } from "@/components/dashboard/category-badge";
import { DietBadge, DishTypeBadge } from "@/components/dashboard/diet-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ShoppingBag, User } from "lucide-react";
import { formatEur, formatNum, formatDateTimeFr } from "@/lib/utils";
import type { Listing } from "@/lib/mock-data/types";

const ALLERGENS = ["Gluten", "Lactose", "Œuf", "Arachides", "Soja", "Fruits à coque"];

export function ListingDrawer({ listing, onClose }: { listing: Listing | null; onClose: () => void }) {
  if (!listing) return null;
  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <div className="overflow-hidden rounded-md border border-outline-variant">
          <div className="relative aspect-[4/3] w-full bg-surface-container-high">
            <Image src={listing.photo} alt={listing.title} fill className="object-cover" sizes="480px" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-on-surface">{listing.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <ListingStatusBadge status={listing.status} />
            <CategoryBadge category={listing.category} />
            {listing.dishType && <DishTypeBadge dish={listing.dishType} />}
            <Badge variant="neutral">{listing.cuisine}</Badge>
            {listing.diets.map((d) => (
              <DietBadge key={d} diet={d} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Mini label="Prix" value={formatEur(listing.price, { cents: true })} />
          <Mini label="Restant" value={`${listing.portionsLeft}/${listing.portionsTotal}`} />
          <Mini label="Commandes" value={formatNum(listing.orderCount)} />
        </div>

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-sm">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <User className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">{listing.sellerName}</span>
          </div>
          <div className="mt-1.5 text-[11.5px] text-on-surface-variant">
            Expire le {formatDateTimeFr(listing.expiresAt)}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Allergènes déclarés
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {ALLERGENS.slice(0, 3).map((a) => (
              <Badge key={a} variant="warning">{a}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Description
          </h4>
          <p className="rounded-md bg-surface-container-low p-3 text-[13px] text-on-surface-variant">
            Plat préparé maison avec amour selon une recette familiale. Servi en portions individuelles, idéal
            pour un déjeuner ou un dîner. Aucun additif, ingrédients frais sourcés localement.
          </p>
        </div>

        {listing.reportCount > 0 && (
          <div className="rounded-md border border-error/40 bg-error/5 p-3">
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[12px] font-semibold">
                {listing.reportCount} signalement{listing.reportCount > 1 ? "s" : ""} actif
                {listing.reportCount > 1 ? "s" : ""}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] text-on-surface-variant">
              Cette annonce est en cours de revue par l'équipe modération.
            </p>
          </div>
        )}

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] font-medium text-on-surface">
              <ShoppingBag className="h-3.5 w-3.5" />
              Activité commerciale
            </span>
            <span className="text-[11px] text-on-surface-variant">{listing.orderCount} commandes au total</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-container-low p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className="mt-0.5 text-[14px] font-semibold tabular-nums text-on-surface">{value}</div>
    </div>
  );
}
