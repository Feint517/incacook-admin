"use client";

import { Drawer, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bike, Star, Package, MapPin, CreditCard } from "lucide-react";
import { formatDateFr, formatDateTimeFr, formatNum } from "@/lib/utils";
import { ConnectReadinessBadge, ChargesEnabledBadge } from "@/components/dashboard/status-badge";
import {
  DriverStatus,
  KycStatusBadge,
  OnlineBadge,
  VEHICLE_LABEL,
  initialsOf,
  type AdminDriver,
} from "./driver-model";

export function DriverDrawer({
  driver,
  onClose,
}: {
  driver: AdminDriver | null;
  onClose: () => void;
}) {
  if (!driver) return null;

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{initialsOf(driver.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <DialogTitle className="truncate text-lg font-semibold text-on-surface">
              {driver.name || "—"}
            </DialogTitle>
            <p className="truncate text-[13px] text-on-surface-variant">{driver.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <OnlineBadge online={driver.isOnline} />
          <KycStatusBadge status={driver.kycStatus} />
          <DriverStatus driver={driver} />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2">
          <Stat icon={<Bike className="h-4 w-4" />} label="Véhicule" value={driver.vehicleType ? VEHICLE_LABEL[driver.vehicleType] : "—"} />
          <Stat icon={<Package className="h-4 w-4" />} label="Livraisons" value={formatNum(driver.totalDeliveries)} />
          <Stat icon={<Star className="h-4 w-4" />} label="Note" value={driver.averageRating != null ? driver.averageRating.toFixed(1) : "—"} />
          <Stat
            icon={<CreditCard className="h-4 w-4" />}
            label="Stripe Connect"
            value={
              <div className="flex items-center gap-1.5">
                <ConnectReadinessBadge
                  stripeDetailsSubmitted={driver.stripeDetailsSubmitted}
                  stripePayoutsEnabled={driver.stripePayoutsEnabled}
                />
                <ChargesEnabledBadge stripeChargesEnabled={driver.stripeChargesEnabled} />
              </div>
            }
          />
        </div>

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            <MapPin className="h-3.5 w-3.5" /> Zones d&apos;opération
          </p>
          {driver.zones.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {driver.zones.map((z) => (
                <span key={z} className="rounded-full bg-surface-container-high px-2 py-0.5 text-[11px] text-on-surface">
                  {z}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-on-surface-variant">Aucune zone sélectionnée</p>
          )}
        </div>

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px]">
          <Row label="Dernière activité" value={driver.lastSeenAt ? formatDateTimeFr(driver.lastSeenAt) : "—"} />
          <Row label="Inscrit le" value={formatDateFr(driver.createdAt)} />
        </div>
      </div>
    </Drawer>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-low p-2.5">
      <div className="flex items-center gap-1.5 text-on-surface-variant">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-[14px] font-semibold text-on-surface">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-on-surface-variant">{label}</span>
      <span className="text-on-surface">{value}</span>
    </div>
  );
}
