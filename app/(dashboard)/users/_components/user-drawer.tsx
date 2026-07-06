"use client";

import {
  Mail,
  Phone,
  Calendar,
  Star,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { Drawer } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAdminQuery } from "@/lib/query";
import { formatDateFr, formatDateTimeFr, formatNum } from "@/lib/utils";
import {
  fullName,
  initialsOf,
  UserRoleBadge,
  UserStatus,
  type AdminUser,
} from "./user-model";
import { UserSanctions } from "./user-sanctions";

interface Props {
  /** The row clicked in the list, or `null` when the drawer is closed. */
  user: AdminUser | null;
  onClose: () => void;
  /** Refetch the parent users list after a sanction changes the row status. */
  onChanged?: () => void;
}

export function UserDrawer({ user, onClose, onChanged }: Props) {
  // Always call the hook (rules of hooks); it stays idle until a row is opened.
  // We re-fetch the full record by id so the drawer reflects the latest state.
  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useAdminQuery<AdminUser>({
    path: user ? `/admin/users/${user.id}` : "/admin/users/__none__",
    enabled: !!user,
    searchDebounceMs: 0,
  });

  // Prefer the freshly fetched detail; fall back to the row we already have so
  // the header paints instantly while the request is in flight.
  const u = (detail && user && detail.id === user.id ? detail : user) as
    | AdminUser
    | null;

  return (
    <Drawer open={!!user} onOpenChange={(o) => !o && onClose()}>
      {u && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{initialsOf(u)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-on-surface">
                {fullName(u)}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <UserRoleBadge role={u.role} />
                <UserStatus user={u} />
              </div>
            </div>
          </div>

          {isError && (
            <p className="rounded-md border border-error/40 bg-error/10 px-3 py-2 text-xs text-error">
              Impossible de charger le détail de l’utilisateur.
            </p>
          )}

          <div className="grid grid-cols-1 gap-2 rounded-md border border-outline-variant bg-surface-container-low p-3 text-sm">
            <Row icon={Mail} value={u.email} />
            <Row icon={Phone} value={u.phone ?? "—"} />
            <Row
              icon={Calendar}
              value={`Inscrit le ${formatDateFr(u.createdAt)}`}
            />
          </div>

          {u.isSuspended && (
            <div className="rounded-md border border-error/40 bg-error/10 p-3">
              <div className="flex items-center gap-2 text-error">
                <Ban className="h-3.5 w-3.5" />
                <span className="text-[13px] font-semibold">
                  Compte suspendu
                </span>
              </div>
              {u.suspendedAt && (
                <div className="mt-1.5 flex items-center gap-2 text-on-surface-variant">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[12px]">
                    Depuis le {formatDateTimeFr(u.suspendedAt)}
                  </span>
                </div>
              )}
              {u.suspensionReason && (
                <div className="mt-1.5 flex items-start gap-2 text-on-surface-variant">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="text-[12px] text-on-surface">
                    {u.suspensionReason}
                  </span>
                </div>
              )}
            </div>
          )}

          {u.averageRating != null && (
            <>
              <Separator />
              <div>
                <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Performance vendeur
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Mini
                    label="Note moyenne"
                    value={`${u.averageRating.toFixed(1)} / 5`}
                    icon={Star}
                  />
                  <Mini
                    label="Avis"
                    value={formatNum(u.reviewCount ?? 0)}
                  />
                </div>
              </div>
            </>
          )}

          <UserSanctions
            user={u}
            onMutated={() => {
              refetch();
              onChanged?.();
            }}
          />

          {isLoading && (
            <p className="text-center text-[11px] text-on-surface-variant">
              Actualisation…
            </p>
          )}
        </div>
      )}
    </Drawer>
  );
}

function Row({
  icon: Icon,
  value,
}: {
  icon: typeof Mail;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-on-surface-variant">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate text-[13px] text-on-surface">{value}</span>
    </div>
  );
}

function Mini({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Star;
}) {
  return (
    <div className="rounded-md bg-surface-container-low p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-on-surface-variant">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-on-surface">
        {value}
      </div>
    </div>
  );
}
