"use client";

/**
 * Moderation sanctions for the user drawer (TASK-006): strike history +
 * add-strike / suspend / unsuspend actions.
 *
 * Reads: `GET /v1/admin/strikes?userId=…` (server-side per-user filter — the
 * controller takes a `userId` query param and delegates to
 * `StrikesService.listForUser`).
 *
 * Writes (all through `useAdminMutation`, which inherits the admin bearer +
 * 401→refresh→replay):
 *  - `POST /v1/admin/users/:userId/strikes`   (AddStrikeDto → { created, suspended })
 *  - `POST /v1/admin/users/:userId/suspend`   (SuspendUserDto, 204)
 *  - `POST /v1/admin/users/:userId/unsuspend` (204)
 *
 * After any mutation we call `onMutated()` so the drawer re-fetches the user
 * detail AND the parent list refetches — keeping the drawer header and the
 * table row status in sync. The strike list refetches locally on add.
 */

import { useState } from "react";
import { AlertTriangle, Ban, Plus, ShieldOff, ShieldCheck } from "lucide-react";
import { post } from "@/lib/api";
import { useAdminQuery, useAdminMutation } from "@/lib/query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, formatDateTimeFr } from "@/lib/utils";
import type { AdminUser } from "./user-model";
import {
  ACTOR_ROLES,
  ACTOR_ROLE_LABEL,
  SEVERITIES,
  SOURCE_TYPES,
  StrikeSeverityBadge,
  actorRoleLabel,
  sourceTypeLabel,
  defaultActorRole,
  type ActorRole,
  type StrikeSeverity,
  type StrikeSourceType,
  type StrikesListResponse,
} from "./strike-model";

interface Props {
  user: AdminUser;
  /** Refetch the drawer detail + the parent list after a status change. */
  onMutated: () => void;
}

export function UserSanctions({ user, onMutated }: Props) {
  const userId = user.id;
  const [dialog, setDialog] = useState<null | "strike" | "suspend" | "unsuspend">(
    null,
  );

  const strikes = useAdminQuery<StrikesListResponse>({
    path: "/admin/strikes",
    enabled: true,
    searchDebounceMs: 0,
    params: { extra: { userId } },
  });

  const rows = strikes.data ?? [];

  return (
    <>
      <Separator />

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Sanctions
          </h4>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDialog("strike")}
            >
              <Plus className="h-3.5 w-3.5" />
              Strike
            </Button>
            {user.isSuspended ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDialog("unsuspend")}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Réactiver
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                className="bg-error text-white hover:bg-error/90"
                onClick={() => setDialog("suspend")}
              >
                <ShieldOff className="h-3.5 w-3.5" />
                Suspendre
              </Button>
            )}
          </div>
        </div>

        {/* Strike history */}
        <div>
          <h5 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
            Historique des strikes
          </h5>
          {strikes.isLoading && rows.length === 0 ? (
            <p className="text-[11px] text-on-surface-variant">Chargement…</p>
          ) : strikes.isError ? (
            <p className="rounded-md border border-error/40 bg-error/10 px-2.5 py-1.5 text-[11px] text-error">
              {strikes.error?.message ?? "Impossible de charger les strikes."}
            </p>
          ) : rows.length === 0 ? (
            <p className="text-[11px] text-on-surface-variant">Aucun strike.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {rows.map((s) => (
                <li
                  key={s.id}
                  className="rounded-md border border-outline-variant bg-surface-container-low p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <StrikeSeverityBadge severity={s.severity} />
                      <span className="text-[11px] font-medium tabular-nums text-on-surface">
                        {s.points} pt{s.points > 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {actorRoleLabel(s.actorRole)}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] text-on-surface-variant">
                      {formatDateTimeFr(s.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-on-surface">{s.reason}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-on-surface-variant">
                    <span>{sourceTypeLabel(s.sourceType)}</span>
                    {s.notes && (
                      <span className="truncate italic">· {s.notes}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <AddStrikeDialog
        open={dialog === "strike"}
        onClose={() => setDialog(null)}
        user={user}
        onDone={() => {
          strikes.refetch();
          onMutated();
        }}
      />
      <SuspendDialog
        open={dialog === "suspend"}
        onClose={() => setDialog(null)}
        user={user}
        onDone={onMutated}
      />
      <UnsuspendDialog
        open={dialog === "unsuspend"}
        onClose={() => setDialog(null)}
        userId={userId}
        onDone={onMutated}
      />
    </>
  );
}

// --- Add strike -------------------------------------------------------------

function AddStrikeDialog({
  open,
  onClose,
  user,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  user: AdminUser;
  onDone: () => void;
}) {
  const [role, setRole] = useState<ActorRole>(defaultActorRole(user.role));
  const [severity, setSeverity] = useState<StrikeSeverity>("LIGHT");
  const [sourceType, setSourceType] = useState<StrikeSourceType>("SYSTEM");
  const [points, setPoints] = useState(1);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useAdminMutation<
    { created: boolean; suspended: boolean },
    {
      role: ActorRole;
      points: number;
      reason: string;
      severity: StrikeSeverity;
      sourceType: StrikeSourceType;
      notes?: string;
    }
  >((body, opts) => post(`/admin/users/${user.id}/strikes`, body, opts));

  const canSubmit = reason.trim().length > 0 && !mutation.isPending;

  async function submit() {
    if (!canSubmit) return;
    try {
      await mutation.mutate({
        role,
        points,
        reason: reason.trim(),
        severity,
        sourceType,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      onDone();
      handleClose();
    } catch {
      // error surfaced via mutation.error
    }
  }

  function handleClose() {
    mutation.reset();
    setReason("");
    setNotes("");
    setPoints(1);
    setSeverity("LIGHT");
    setSourceType("SYSTEM");
    onClose();
  }

  return (
    <SanctionDialog
      open={open}
      onClose={handleClose}
      title="Ajouter un strike"
      description="Enregistre une infraction. 3 points actifs (90 j) suspendent automatiquement le compte."
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rôle">
          <RoleSelect value={role} onChange={setRole} />
        </Field>
        <Field label="Gravité">
          <Select
            value={severity}
            onValueChange={(v) => setSeverity(v as StrikeSeverity)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Source">
          <Select
            value={sourceType}
            onValueChange={(v) => setSourceType(v as StrikeSourceType)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_TYPES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {sourceTypeLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Points (1–3)">
          <Input
            type="number"
            min={1}
            max={3}
            value={points}
            onChange={(e) =>
              setPoints(Math.min(3, Math.max(1, Number(e.target.value) || 1)))
            }
            className="h-8 text-xs"
          />
        </Field>
      </div>

      <Field label="Raison" className="mt-3">
        <Input
          value={reason}
          maxLength={120}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif de la sanction"
          className="h-8 text-xs"
        />
      </Field>
      <Field label="Notes (optionnel)" className="mt-3">
        <textarea
          value={notes}
          maxLength={500}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </Field>

      <DialogError message={mutation.error?.message} />

      <DialogActions
        onCancel={handleClose}
        confirmLabel="Ajouter le strike"
        onConfirm={submit}
        disabled={!canSubmit}
        pending={mutation.isPending}
      />
    </SanctionDialog>
  );
}

// --- Suspend ----------------------------------------------------------------

function SuspendDialog({
  open,
  onClose,
  user,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  user: AdminUser;
  onDone: () => void;
}) {
  const [role, setRole] = useState<ActorRole>(defaultActorRole(user.role));
  const [reason, setReason] = useState("");

  const mutation = useAdminMutation<void, { role: ActorRole; reason: string }>(
    (body, opts) => post(`/admin/users/${user.id}/suspend`, body, opts),
  );

  const canSubmit = reason.trim().length > 0 && !mutation.isPending;

  async function submit() {
    if (!canSubmit) return;
    try {
      await mutation.mutate({ role, reason: reason.trim() });
      onDone();
      handleClose();
    } catch {
      // surfaced via mutation.error
    }
  }

  function handleClose() {
    mutation.reset();
    setReason("");
    onClose();
  }

  return (
    <SanctionDialog
      open={open}
      onClose={handleClose}
      title="Suspendre le compte"
      description={`Le compte de ${user.firstName} ${user.lastName} sera immédiatement suspendu. L'utilisateur en sera notifié.`}
      destructive
    >
      <Field label="Rôle">
        <RoleSelect value={role} onChange={setRole} />
      </Field>
      <Field label="Raison" className="mt-3">
        <Input
          value={reason}
          maxLength={200}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif de la suspension"
          className="h-8 text-xs"
        />
      </Field>

      <DialogError message={mutation.error?.message} />

      <DialogActions
        onCancel={handleClose}
        confirmLabel="Suspendre"
        onConfirm={submit}
        disabled={!canSubmit}
        pending={mutation.isPending}
        destructive
      />
    </SanctionDialog>
  );
}

// --- Unsuspend --------------------------------------------------------------

function UnsuspendDialog({
  open,
  onClose,
  userId,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  onDone: () => void;
}) {
  const mutation = useAdminMutation<void, void>((_, opts) =>
    post(`/admin/users/${userId}/unsuspend`, undefined, opts),
  );

  async function submit() {
    try {
      await mutation.mutate();
      onDone();
      handleClose();
    } catch {
      // surfaced via mutation.error
    }
  }

  function handleClose() {
    mutation.reset();
    onClose();
  }

  return (
    <SanctionDialog
      open={open}
      onClose={handleClose}
      title="Réactiver le compte"
      description="La suspension sera levée et l'utilisateur pourra de nouveau accéder à son compte."
    >
      <DialogError message={mutation.error?.message} />
      <DialogActions
        onCancel={handleClose}
        confirmLabel="Réactiver"
        onConfirm={submit}
        pending={mutation.isPending}
        disabled={mutation.isPending}
      />
    </SanctionDialog>
  );
}

// --- Shared dialog scaffolding ---------------------------------------------

function SanctionDialog({
  open,
  onClose,
  title,
  description,
  destructive,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex items-center gap-2">
          {destructive ? (
            <Ban className="h-4 w-4 text-error" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-on-surface-variant" />
          )}
          <DialogTitle className="text-sm">{title}</DialogTitle>
        </div>
        <DialogDescription className="text-xs">{description}</DialogDescription>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
}

function RoleSelect({
  value,
  onChange,
}: {
  value: ActorRole;
  onChange: (r: ActorRole) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ActorRole)}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ACTOR_ROLES.map((r) => (
          <SelectItem key={r} value={r} className="text-xs">
            {ACTOR_ROLE_LABEL[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      {children}
    </label>
  );
}

function DialogError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-3 rounded-md border border-error/40 bg-error/10 px-2.5 py-1.5 text-[11px] text-error">
      {message}
    </p>
  );
}

function DialogActions({
  onCancel,
  onConfirm,
  confirmLabel,
  disabled,
  pending,
  destructive,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  disabled?: boolean;
  pending?: boolean;
  destructive?: boolean;
}) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
        Annuler
      </Button>
      <Button
        size="sm"
        variant="default"
        className={cn(destructive && "bg-error text-white hover:bg-error/90")}
        onClick={onConfirm}
        disabled={disabled}
      >
        {pending ? "En cours…" : confirmLabel}
      </Button>
    </div>
  );
}
