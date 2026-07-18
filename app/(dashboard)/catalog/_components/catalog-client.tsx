"use client";

import { useState } from "react";
import { Boxes, Plus, Pencil, Trash2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTimeFr, formatEurFromCents } from "@/lib/utils";
import { ProductFormDialog } from "./product-form-dialog";
import {
  orderStatusLabel,
  ORDER_STATUS_VARIANT,
  type CatalogOrder,
  type CatalogOrderStatus,
  type CatalogProduct,
} from "./types";

const PAGE_SIZE = 12;

export function CatalogClient() {
  return (
    <Tabs defaultValue="products">
      <TabsList>
        <TabsTrigger value="products">Produits</TabsTrigger>
        <TabsTrigger value="orders">Commandes</TabsTrigger>
      </TabsList>
      <TabsContent value="products">
        <ProductsTab />
      </TabsContent>
      <TabsContent value="orders">
        <OrdersTab />
      </TabsContent>
    </Tabs>
  );
}

// --- Products ----------------------------------------------------------------

function ProductsTab() {
  // `GET /admin/catalog/products` returns a bare array — client-side paging.
  const { data, isLoading, isError, error, refetch } = useAdminQuery<
    CatalogProduct[]
  >({ path: "/admin/catalog/products" });

  const rows = data ?? [];

  // `null` when the form dialog is closed; `{ product: null }` for create,
  // `{ product }` for edit.
  const [form, setForm] = useState<{ product: CatalogProduct | null } | null>(
    null,
  );
  const [toDelete, setToDelete] = useState<CatalogProduct | null>(null);

  const remove = useAdminMutation<void, string>((id, opts) =>
    del(`/admin/catalog/products/${id}`, opts),
  );

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await remove.mutate(toDelete.id);
      setToDelete(null);
      refetch();
    } catch {
      // Surfaced via remove.error inside the dialog (e.g. product referenced
      // by an open order → backend error message shown verbatim).
    }
  }

  const cols: Column<CatalogProduct>[] = [
    {
      key: "name",
      header: "Produit",
      cell: (p) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-on-surface">{p.name}</div>
          {p.description && (
            <div className="truncate text-[11px] text-on-surface-variant">
              {p.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Prix",
      width: "120px",
      align: "right",
      cell: (p) => (
        <span className="font-mono text-[13px] text-on-surface">
          {formatEurFromCents(p.priceCents)}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Statut",
      width: "110px",
      cell: (p) => (
        <Badge variant={p.isActive ? "success" : "neutral"}>
          {p.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      width: "160px",
      cell: (p) => (
        <span className="text-[12px] text-on-surface-variant">
          {formatDateTimeFr(p.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "96px",
      align: "right",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Modifier"
            onClick={(e) => {
              e.stopPropagation();
              setForm({ product: p });
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Supprimer"
            className="text-error hover:bg-error/10"
            onClick={(e) => {
              e.stopPropagation();
              remove.reset();
              setToDelete(p);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="frost mb-4 flex flex-col gap-3 rounded-md p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-[13px] text-on-surface-variant">
          <Boxes className="h-4 w-4" />
          Catalogue des produits B2B
        </div>
        <Button variant="default" size="sm" onClick={() => setForm({ product: null })}>
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Button>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(p) => p.id}
        onRowClick={(p) => setForm({ product: p })}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel="Aucun produit au catalogue."
        pageSize={PAGE_SIZE}
      />

      <ProductFormDialog
        open={form != null}
        product={form?.product ?? null}
        onClose={() => setForm(null)}
        onSaved={() => {
          setForm(null);
          refetch();
        }}
      />

      <Dialog
        open={toDelete != null}
        onOpenChange={(o) => {
          if (!o && !remove.isPending) setToDelete(null);
        }}
      >
        <DialogContent>
          {toDelete && (
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <DialogTitle>Supprimer le produit</DialogTitle>
                <DialogDescription>
                  Supprimer «&nbsp;{toDelete.name}&nbsp;» du catalogue ? L’historique
                  des commandes est conservé (suppression logique).
                </DialogDescription>
              </div>

              {remove.error && (
                <p className="text-[12px] text-error">{remove.error.message}</p>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setToDelete(null)}
                  disabled={remove.isPending}
                >
                  Annuler
                </Button>
                <Button
                  variant="outline"
                  className="border-error/40 text-error hover:bg-error/10"
                  onClick={confirmDelete}
                  disabled={remove.isPending}
                >
                  {remove.isPending ? "Suppression…" : "Supprimer"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Orders (read-only) ------------------------------------------------------

function OrdersTab() {
  const { data, isLoading, isError, error, refetch } = useAdminQuery<
    CatalogOrder[]
  >({ path: "/admin/catalog/orders" });

  const rows = data ?? [];

  const cols: Column<CatalogOrder>[] = [
    {
      key: "id",
      header: "Commande",
      cell: (o) => (
        <div className="min-w-0">
          <div className="truncate font-mono text-[12px] text-on-surface">
            {o.id}
          </div>
          <div className="truncate text-[11px] text-on-surface-variant">
            {o.items.reduce((n, it) => n + it.quantity, 0)} article(s)
          </div>
        </div>
      ),
    },
    {
      key: "seller",
      header: "Vendeur",
      width: "240px",
      cell: (o) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] text-on-surface">
            {o.seller.name || "—"}
          </div>
          <div className="truncate text-[11px] text-on-surface-variant">
            {o.seller.email}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      width: "120px",
      align: "right",
      cell: (o) => (
        <span className="font-mono text-[13px] text-on-surface">
          {formatEurFromCents(o.totalCents)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      width: "130px",
      cell: (o) => (
        <Badge
          variant={
            ORDER_STATUS_VARIANT[o.status as CatalogOrderStatus] ?? "neutral"
          }
        >
          {orderStatusLabel(o.status)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Passée le",
      width: "160px",
      cell: (o) => (
        <span className="text-[12px] text-on-surface-variant">
          {formatDateTimeFr(o.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={cols}
      rows={rows}
      rowKey={(o) => o.id}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
      emptyLabel="Aucune commande catalogue."
      pageSize={PAGE_SIZE}
    />
  );
}
