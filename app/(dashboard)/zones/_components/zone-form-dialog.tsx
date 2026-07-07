"use client";

import { useEffect, useState } from "react";
import { post, put } from "@/lib/api";
import { useAdminMutation } from "@/lib/query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateZoneBody, UpdateZoneBody, Zone } from "./types";

interface Props {
  open: boolean;
  /** Zone being edited, or `null` for create mode. */
  zone: Zone | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  name: string;
  city: string;
  displayOrder: string;
  lat: string;
  lng: string;
  isActive: boolean;
}

const EMPTY: FormState = {
  name: "",
  city: "",
  displayOrder: "0",
  lat: "",
  lng: "",
  isActive: true,
};

function fromZone(z: Zone): FormState {
  return {
    name: z.name,
    city: z.city ?? "",
    displayOrder: String(z.displayOrder ?? 0),
    lat: z.lat != null ? String(z.lat) : "",
    lng: z.lng != null ? String(z.lng) : "",
    isActive: z.isActive,
  };
}

/** Parse an optional numeric field; returns undefined for empty, NaN → invalid. */
function optNum(v: string): number | undefined | null {
  const t = v.trim();
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : null; // null = invalid
}

export function ZoneFormDialog({ open, zone, onClose, onSaved }: Props) {
  const isEdit = zone != null;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [validation, setValidation] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(zone ? fromZone(zone) : EMPTY);
      setValidation(null);
    }
  }, [open, zone]);

  const save = useAdminMutation<Zone, CreateZoneBody | UpdateZoneBody>(
    (body, opts) =>
      isEdit
        ? put(`/zones/${zone!.id}`, body, opts)
        : post("/zones", body, opts),
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (save.isPending) return;
    setValidation(null);

    if (!form.name.trim()) return setValidation("Le nom est requis.");
    const order = optNum(form.displayOrder);
    if (order === null || (order !== undefined && (order < 0 || order > 1000)))
      return setValidation("L'ordre doit être un entier entre 0 et 1000.");
    const lat = optNum(form.lat);
    if (lat === null || (lat !== undefined && (lat < -90 || lat > 90)))
      return setValidation("La latitude doit être comprise entre −90 et 90.");
    const lng = optNum(form.lng);
    if (lng === null || (lng !== undefined && (lng < -180 || lng > 180)))
      return setValidation("La longitude doit être comprise entre −180 et 180.");

    const body: CreateZoneBody = {
      name: form.name.trim(),
      isActive: form.isActive,
      ...(order !== undefined ? { displayOrder: order } : {}),
      ...(form.city.trim() ? { city: form.city.trim() } : {}),
      ...(lat !== undefined ? { lat } : {}),
      ...(lng !== undefined ? { lng } : {}),
    };

    try {
      await save.mutate(body);
      onSaved();
      onClose();
    } catch {
      // save.error is rendered inline.
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogTitle>{isEdit ? "Modifier la zone" : "Nouvelle zone"}</DialogTitle>
        <DialogDescription>
          Zones d&apos;opération proposées aux livreurs à l&apos;inscription.
        </DialogDescription>

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Field label="Nom" htmlFor="z-name">
            <Input
              id="z-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Paris 11e"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville" htmlFor="z-city">
              <Input
                id="z-city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Paris"
              />
            </Field>
            <Field label="Ordre d'affichage" htmlFor="z-order">
              <Input
                id="z-order"
                inputMode="numeric"
                value={form.displayOrder}
                onChange={(e) => set("displayOrder", e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" htmlFor="z-lat">
              <Input
                id="z-lat"
                inputMode="decimal"
                value={form.lat}
                onChange={(e) => set("lat", e.target.value)}
                placeholder="48.86"
              />
            </Field>
            <Field label="Longitude" htmlFor="z-lng">
              <Input
                id="z-lng"
                inputMode="decimal"
                value={form.lng}
                onChange={(e) => set("lng", e.target.value)}
                placeholder="2.35"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant"
            />
            Active (visible dans le sélecteur livreur)
          </label>

          {(validation || save.error) && (
            <p role="alert" className="rounded-md border border-error/40 bg-error/5 px-3 py-2 text-sm text-error">
              {validation ?? save.error?.message}
              {!validation && save.error?.correlationId ? ` (réf. ${save.error.correlationId})` : ""}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={save.isPending}>
              Annuler
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-on-surface-variant">
        {label}
      </label>
      {children}
    </div>
  );
}
