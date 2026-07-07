"use client";

import { useState } from "react";
import { FileText, Plus, CheckCircle2 } from "lucide-react";
import { useAdminQuery } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTimeFr } from "@/lib/utils";
import { LegalDocumentDrawer } from "./legal-document-drawer";
import {
  kindShort,
  kindLabel,
  type LegalDocument,
} from "./types";

const PAGE_SIZE = 20;

export function LegalClient() {
  // Drawer state: `creating` opens a blank draft form; `editing` opens an
  // existing document for edit + publish. Only one is active at a time.
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<LegalDocument | null>(null);

  // Both endpoints return a bare array (no pagination envelope), so paging is
  // client-side via the DataTable.
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminQuery<LegalDocument[]>({ path: "/admin/legal-documents" });

  // The currently-active version per kind (≤ 1 per kind). Used for the summary
  // banner; the list rows carry their own `isActive` flag too.
  const activeQuery = useAdminQuery<LegalDocument[]>({
    path: "/admin/legal-documents/active",
  });

  const rows = data ?? [];
  const active = activeQuery.data ?? [];

  function onSaved() {
    setCreating(false);
    setEditing(null);
    refetch();
    activeQuery.refetch();
  }

  const cols: Column<LegalDocument>[] = [
    {
      key: "kind",
      header: "Type",
      width: "90px",
      cell: (d) => (
        <Badge variant="secondary" title={kindLabel(d.kind)}>
          {kindShort(d.kind)}
        </Badge>
      ),
    },
    {
      key: "version",
      header: "Version",
      width: "110px",
      cell: (d) => (
        <span className="font-mono text-[12px] text-on-surface">
          {d.version}
        </span>
      ),
    },
    {
      key: "title",
      header: "Titre",
      cell: (d) => (
        <span className="min-w-0 truncate text-[13px] text-on-surface">
          {d.title}
        </span>
      ),
    },
    {
      key: "status",
      header: "État",
      width: "130px",
      cell: (d) =>
        d.isActive ? (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        ) : (
          <Badge variant="neutral">Brouillon</Badge>
        ),
    },
    {
      key: "publishedAt",
      header: "Publiée le",
      width: "160px",
      cell: (d) => (
        <span className="text-[12px] text-on-surface-variant">
          {d.publishedAt ? formatDateTimeFr(d.publishedAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="frost mb-4 flex flex-col gap-3 rounded-md p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-[13px] text-on-surface-variant">
            <FileText className="h-4 w-4" />
            Versions légales CGU / CGV
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {active.length === 0 ? (
              <span className="text-[11px] text-on-surface-variant">
                {activeQuery.isLoading
                  ? "Chargement des versions actives…"
                  : "Aucune version active."}
              </span>
            ) : (
              active.map((d) => (
                <Badge key={d.id} variant="success" title={kindLabel(d.kind)}>
                  <CheckCircle2 className="h-3 w-3" />
                  {kindShort(d.kind)} · {d.version}
                </Badge>
              ))
            )}
          </div>
        </div>
        <Button variant="default" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          Nouveau brouillon
        </Button>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(d) => d.id}
        onRowClick={(d) => setEditing(d)}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel="Aucun document légal. Créez un brouillon pour commencer."
        pageSize={PAGE_SIZE}
      />

      <LegalDocumentDrawer
        mode={creating ? "create" : editing ? "edit" : null}
        document={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={onSaved}
      />
    </>
  );
}
