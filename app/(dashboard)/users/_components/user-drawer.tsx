"use client";

import { Drawer } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/dashboard/role-badge";
import { UserStatusBadge } from "@/components/dashboard/status-badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Mail, MapPin, Calendar, Clock } from "lucide-react";
import { formatDateFr, formatEur, formatNum, relativeTimeFr } from "@/lib/utils";
import type { Order, Seller, User } from "@/lib/mock-data/types";

interface Props {
  user: User | null;
  seller?: Seller;
  orders: Order[];
  onClose: () => void;
}

export function UserDrawer({ user, seller, orders, onClose }: Props) {
  if (!user) return null;
  return (
    <Drawer open={!!user} onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-on-surface">{user.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <RoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-md border border-outline-variant bg-surface-container-low p-3 text-sm">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Mail className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">{user.city}</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">Inscrit le {formatDateFr(user.joined)}</span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[13px] text-on-surface">Dernière activité {relativeTimeFr(user.lastActive)}</span>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Vérifications
          </h4>
          <div className="space-y-2">
            <CheckRow ok={!!user.idVerified} label="Pièce d'identité" />
            <CheckRow ok={!!user.charterSigned} label="Charte signée" />
            <CheckRow ok={user.status === "verified"} label="Compte vérifié" />
          </div>
        </div>

        {seller && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Performance vendeur
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <Mini label="Note" value={`${seller.rating} / 5`} />
                <Mini label="Ventes" value={formatNum(seller.totalSales)} />
                <Mini label="CA" value={formatEur(seller.totalRevenue)} />
              </div>
              <div className="mt-3 space-y-2">
                <Bar label="Hygiène" value={seller.hygieneOk ? 100 : 50} variant={seller.hygieneOk ? "success" : "error"} />
                <Bar label="Qualité du plat" value={(seller.qualityScore / 5) * 100} />
                <Bar label="Emballage" value={(seller.packagingScore / 5) * 100} />
              </div>
            </div>
          </>
        )}

        <Separator />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Historique de commandes
            </h4>
            <span className="text-[11px] text-on-surface-variant">{orders.length} au total</span>
          </div>
          <div className="space-y-1.5">
            {orders.slice(0, 6).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-md border border-outline-variant/40 bg-surface px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-on-surface">
                    {o.sellerName}
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    {o.itemCount} article{o.itemCount > 1 ? "s" : ""} · {relativeTimeFr(o.date)}
                  </div>
                </div>
                <span className="font-semibold tabular-nums text-on-surface">
                  {formatEur(o.total, { cents: true })}
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="rounded-md border border-dashed border-outline-variant px-3 py-4 text-center text-xs text-on-surface-variant">
                Aucune commande pour cet utilisateur.
              </p>
            )}
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-container-low p-2">
      <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-on-surface">{value}</div>
    </div>
  );
}

function Bar({ label, value, variant = "primary" }: { label: string; value: number; variant?: "primary" | "success" | "error" }) {
  const color = variant === "primary" ? "bg-primary" : variant === "success" ? "bg-success" : "bg-error";
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-medium text-on-surface">{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
