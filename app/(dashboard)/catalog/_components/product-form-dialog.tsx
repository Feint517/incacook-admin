"use client";

import { useEffect, useState } from "react";
import { post, patch } from "@/lib/api";
import { useAdminMutation } from "@/lib/query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  centsToEuroInput,
  euroInputToCents,
  type CatalogProduct,
  type CreateCatalogProductBody,
  type UpdateCatalogProductBody,
} from "./types";

interface Props {
  open: boolean;
  /** The product being edited, or `null` for create mode. */
  product: CatalogProduct | null;
  onClose: () => void;
  /** Fired after a successful create/update so the list can refetch. */
  onSaved: () => void;
}

interface FormState {
  name: string;
  description: string;
  /** Euros as typed (converted to integer cents on submit). */
  priceEur: string;
  /** One image URL per line (optional, max 6). */
  imageUrls: string;
  isActive: boolean;
}

const EMPTY: FormState = {
  name: "",
  description: "",
  priceEur: "",
  imageUrls: "",
  isActive: true,
};

function fromProduct(p: CatalogProduct): FormState {
  return {
    name: p.name,
    description: p.description ?? "",
    priceEur: centsToEuroInput(p.priceCents),
    imageUrls: p.imageUrls.join("\n"),
    isActive: p.isActive,
  };
}

export function ProductFormDialog({ open, product, onClose, onSaved }: Props) {
  const isEdit = product != null;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [validation, setValidation] = useState<string | null>(null);

  const create = useAdminMutation<CatalogProduct, CreateCatalogProductBody>(
    (body, opts) => post("/admin/catalog/products", body, opts),
  );
  const update = useAdminMutation<
    CatalogProduct,
    { id: string; body: UpdateCatalogProductBody }
  >(({ id, body }, opts) => patch(`/admin/catalog/products/${id}`, body, opts));

  const busy = create.isPending || update.isPending;
  const serverError = create.error?.message ?? update.error?.message ?? null;

  // Reset the form whenever the dialog (re)opens for a different target.
  useEffect(() => {
    if (!open) return;
    setForm(product ? fromProduct(product) : EMPTY);
    setValidation(null);
    create.reset();
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function parseImageUrls(): string[] {
    return form.imageUrls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
  }

  async function handleSubmit() {
    setValidation(null);

    const name = form.name.trim();
    if (name.length < 2 || name.length > 120) {
      setValidation("Le nom doit contenir entre 2 et 120 caractères.");
      return;
    }

    const priceCents = euroInputToCents(form.priceEur);
    if (priceCents == null) {
      setValidation("Le prix doit être un montant en euros supérieur à 0.");
      return;
    }

    const imageUrls = parseImageUrls();
    if (imageUrls.length > 6) {
      setValidation("Six images au maximum.");
      return;
    }

    const description = form.description.trim();

    try {
      if (isEdit && product) {
        const body: UpdateCatalogProductBody = {
          name,
          description: description || undefined,
          imageUrls,
          priceCents,
          isActive: form.isActive,
        };
        await update.mutate({ id: product.id, body });
      } else {
        const body: CreateCatalogProductBody = {
          name,
          description: description || undefined,
          imageUrls,
          priceCents,
          isActive: form.isActive,
        };
        await create.mutate(body);
      }
      onSaved();
    } catch {
      // Surfaced via serverError below.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !busy) onClose();
      }}
    >
      <DialogContent className="max-w-xl">
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <DialogTitle>
              {isEdit ? "Modifier le produit" : "Nouveau produit"}
            </DialogTitle>
            <DialogDescription>
              Produits du catalogue B2B vendus aux vendeurs.
            </DialogDescription>
          </div>

          <Field label="Nom" htmlFor="product-name">
            <Input
              id="product-name"
              value={form.name}
              maxLength={120}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Nom du produit"
            />
          </Field>

          <Field label="Description (optionnelle)" htmlFor="product-desc">
            <textarea
              id="product-desc"
              value={form.description}
              maxLength={2000}
              rows={3}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Description du produit…"
              className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </Field>

          <Field label="Prix (€)" htmlFor="product-price">
            <Input
              id="product-price"
              type="number"
              inputMode="decimal"
              min={0.01}
              step="0.01"
              value={form.priceEur}
              onChange={(e) => set("priceEur", e.target.value)}
              placeholder="0,00"
            />
          </Field>

          <Field
            label="Images — une URL par ligne (optionnel, max 6)"
            htmlFor="product-images"
          >
            <textarea
              id="product-images"
              value={form.imageUrls}
              rows={3}
              onChange={(e) => set("imageUrls", e.target.value)}
              placeholder="https://…"
              className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 font-mono text-[12px] text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </Field>

          <label className="flex items-center gap-2 text-[13px] text-on-surface">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant accent-primary"
            />
            Actif (visible et achetable par les vendeurs)
          </label>

          {(validation || serverError) && (
            <p className="text-[12px] text-error">{validation ?? serverError}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={busy}>
              Annuler
            </Button>
            <Button variant="default" onClick={handleSubmit} disabled={busy}>
              {busy ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </div>
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
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
