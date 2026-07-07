"use client";

import Image from "next/image";
import { AlertTriangle, ImageOff, ShoppingBag, User } from "lucide-react";
import { Drawer } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatEur, formatNum, formatDateTimeFr } from "@/lib/utils";
import {
  CategoryChip,
  CuisineChip,
  DietChip,
  DishTypeChip,
  ListingStatus,
  type AdminListing,
} from "./listing-model";

/**
 * Listing detail rendered entirely from the row already in hand — the admin
 * list endpoint returns every field the drawer shows, so there is no
 * `GET /admin/listings/:id`.
 */
export function ListingDrawer({
  listing,
  onClose,
}: {
  listing: AdminListing | null;
  onClose: () => void;
}) {
  if (!listing) return null;

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <div className="overflow-hidden rounded-md border border-outline-variant">
          <div className="relative aspect-[4/3] w-full bg-surface-container-high">
            {listing.photo ? (
              <Image
                src={listing.photo}
                alt={listing.title}
                fill
                sizes="480px"
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
                <ImageOff className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-on-surface">{listing.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <ListingStatus status={listing.status} />
            <CategoryChip category={listing.category} />
            {listing.dishTypes.map((d) => (
              <DishTypeChip key={`dt-${d}`} dish={d} />
            ))}
            {listing.cuisineTypes.map((c) => (
              <CuisineChip key={`c-${c}`} cuisine={c} />
            ))}
            {listing.dietaryTags.map((d) => (
              <DietChip key={`d-${d}`} tag={d} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Mini label="Prix" value={formatEur(listing.priceCents / 100, { cents: true })} />
          <Mini
            label="Portions restantes"
            value={listing.portionsLeft != null ? formatNum(listing.portionsLeft) : "—"}
          />
          <Mini label="Commandes" value={formatNum(listing.orderCount)} />
        </div>

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-sm">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <User className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">{listing.sellerName}</span>
          </div>
          <div className="mt-1.5 text-[11.5px] text-on-surface-variant">
            {listing.expiresAt
              ? `Expire le ${formatDateTimeFr(listing.expiresAt)}`
              : "Sans date d'expiration"}
          </div>
        </div>

        <Separator />
        <div className="grid grid-cols-2 gap-2 text-[11.5px] text-on-surface-variant">
          <Field label="Publiée le" value={formatDateTimeFr(listing.createdAt)} />
          <Field label="ID vendeur" value={listing.sellerId} mono />
        </div>

        {listing.reportCount > 0 && (
          <div className="rounded-md border border-error/40 bg-error/5 p-3">
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[12px] font-semibold">
                {listing.reportCount} signalement{listing.reportCount > 1 ? "s" : ""}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] text-on-surface-variant">
              Cette annonce a été signalée — à examiner par la modération.
            </p>
          </div>
        )}

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] font-medium text-on-surface">
              <ShoppingBag className="h-3.5 w-3.5" />
              Activité commerciale
            </span>
            <span className="text-[11px] text-on-surface-variant">
              {formatNum(listing.orderCount)} commande{listing.orderCount > 1 ? "s" : ""} au total
            </span>
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

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className={mono ? "mt-0.5 truncate font-mono text-[11px] text-on-surface" : "mt-0.5 text-[12px] text-on-surface"}>
        {value}
      </div>
    </div>
  );
}
