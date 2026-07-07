"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Power } from "lucide-react";
import { del } from "@/lib/api";
import { useAdminQuery, useAdminMutation } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ZoneFormDialog } from "./zone-form-dialog";
import type { Zone, ZonesListResponse } from "./types";

export function ZonesClient() {
  const { data, isLoading, isError, error, refetch } =
    useAdminQuery<ZonesListResponse>({ path: "/zones/all" });
  const rows = data ?? [];

  const [editing, setEditing] = useState<Zone | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Zone | null>(null);

  const remove = useAdminMutation<unknown, string>((id, opts) =>
    del(`/zones/${id}`, opts),
  );

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await remove.mutate(toDelete.id);
      setToDelete(null);
      refetch();
    } catch {
      // remove.error rendered inline in the confirm dialog.
    }
  }

  const cols: Column<Zone>[] = [
    {
      key: "name",
      header: "Zone",
      cell: (z) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-on-surface-variant" />
          <span className="text-[13px] font-medium text-on-surface">{z.name}</span>
        </div>
      ),
    },
    {
      key: "city",
      header: "Ville",
      cell: (z) => (
        <span className="text-[13px] text-on-surface-variant">{z.city ?? "—"}</span>
      ),
    },
    { key: "order", header: "Ordre", cell: (z) => <span>{z.displayOrder}</span> },
    {
      key: "coords",
      header: "Coordonnées",
      cell: (z) =>
        z.lat != null && z.lng != null ? (
          <span className="text-[12px] text-on-surface-variant">
            {z.lat.toFixed(3)}, {z.lng.toFixed(3)}
          </span>
        ) : (
          <span className="text-on-surface-variant">—</span>
        ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (z) =>
        z.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="neutral">Inactive</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (z) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(z)} title="Modifier">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setToDelete(z)}
            title="Désactiver"
            className="text-error"
          >
            <Power className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-on-surface-variant">
          {rows.length} zone{rows.length > 1 ? "s" : ""}
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Nouvelle zone
        </Button>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(z) => z.id}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel="Aucune zone. Créez-en une pour le sélecteur livreur."
      />

      <ZoneFormDialog
        open={creating}
        zone={null}
        onClose={() => setCreating(false)}
        onSaved={refetch}
      />
      <ZoneFormDialog
        open={editing != null}
        zone={editing}
        onClose={() => setEditing(null)}
        onSaved={refetch}
      />

      <Dialog open={toDelete != null} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogTitle>Désactiver la zone</DialogTitle>
          <DialogDescription>
            « {toDelete?.name} » sera désactivée et retirée du sélecteur livreur.
          </DialogDescription>
          {remove.error && (
            <p role="alert" className="mt-3 rounded-md border border-error/40 bg-error/5 px-3 py-2 text-sm text-error">
              {remove.error.message}
            </p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={remove.isPending}>
              Annuler
            </Button>
            <Button className="bg-error text-on-error hover:bg-error/90" onClick={confirmDelete} disabled={remove.isPending}>
              {remove.isPending ? "Désactivation…" : "Désactiver"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
