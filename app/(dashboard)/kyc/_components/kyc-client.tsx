"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAdminQuery } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTimeFr } from "@/lib/utils";
import { KycDocumentDrawer } from "./kyc-document-drawer";
import {
  DOC_TYPE_LABEL,
  REVIEW_STATE_LABEL,
  REVIEW_STATE_VARIANT,
  ROLE_LABEL,
  type KycDocumentListItem,
  type KycReviewState,
} from "./types";

const PAGE_SIZE = 20;

const STATE_TABS: { value: KycReviewState; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "APPROVED", label: "Approuvés" },
  { value: "REJECTED", label: "Rejetés" },
];

export function KycClient() {
  const [reviewState, setReviewState] = useState<KycReviewState>("PENDING");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, pagination, isLoading, isError, error, refetch } =
    useAdminQuery<KycDocumentListItem[]>({
      path: "/admin/kyc/documents",
      params: {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        extra: { reviewState },
      },
    });

  const rows = data ?? [];

  function changeState(next: KycReviewState) {
    setReviewState(next);
    setPage(1);
  }

  const cols: Column<KycDocumentListItem>[] = [
    {
      key: "submitter",
      header: "Demandeur",
      cell: (d) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-on-surface">
            {[d.submitter.firstName, d.submitter.lastName]
              .filter(Boolean)
              .join(" ") || "—"}
          </div>
          <div className="truncate text-[11px] text-on-surface-variant">
            {d.submitter.email}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      width: "110px",
      cell: (d) => (
        <span className="text-[13px] text-on-surface-variant">
          {ROLE_LABEL[d.submitter.role] ?? d.submitter.role}
        </span>
      ),
    },
    {
      key: "type",
      header: "Document",
      width: "200px",
      cell: (d) => (
        <span className="text-[13px] text-on-surface">
          {DOC_TYPE_LABEL[d.type] ?? d.type}
        </span>
      ),
    },
    {
      key: "reviewState",
      header: "Statut",
      width: "120px",
      cell: (d) => (
        <Badge variant={REVIEW_STATE_VARIANT[d.reviewState]}>
          {REVIEW_STATE_LABEL[d.reviewState]}
        </Badge>
      ),
    },
    {
      key: "submittedAt",
      header: "Soumis le",
      width: "160px",
      cell: (d) => (
        <span className="text-[12px] text-on-surface-variant">
          {formatDateTimeFr(d.submittedAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="frost mb-4 flex flex-col gap-3 rounded-md p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-[13px] text-on-surface-variant">
          <ShieldCheck className="h-4 w-4" />
          File de vérification KYC
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={reviewState}
            onValueChange={(v) => changeState(v as KycReviewState)}
          >
            <SelectTrigger aria-label="Filtrer par statut">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATE_TABS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(d) => d.id}
        onRowClick={(d) => setActiveId(d.id)}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel={
          reviewState === "PENDING"
            ? "Aucun document en attente de vérification."
            : "Aucun document pour ce statut."
        }
        pageSize={PAGE_SIZE}
        serverPagination={{
          pagination,
          page,
          onPageChange: setPage,
          pageSize: PAGE_SIZE,
          isFetching: isLoading,
        }}
      />

      <KycDocumentDrawer
        documentId={activeId}
        onClose={() => setActiveId(null)}
        onReviewed={() => {
          setActiveId(null);
          refetch();
        }}
      />
    </>
  );
}
