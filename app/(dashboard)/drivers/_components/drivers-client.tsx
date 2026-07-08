"use client";

import { useState } from "react";
import { Search, Bike, Star } from "lucide-react";
import { useAdminQuery } from "@/lib/query";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateFr, formatNum } from "@/lib/utils";
import { DriverDrawer } from "./driver-drawer";
import {
  KYC_OPTIONS,
  KycStatusBadge,
  OnlineBadge,
  VEHICLE_LABEL,
  initialsOf,
  type AdminDriver,
  type AdminDriversListResponse,
  type KycStatus,
} from "./driver-model";

const PAGE_SIZE = 20;
const ALL = "ALL";
const ONLINE_ALL = "ALL";

export function DriversClient() {
  const [search, setSearch] = useState("");
  const [kyc, setKyc] = useState<KycStatus | typeof ALL>(ALL);
  const [online, setOnline] = useState<"true" | "false" | typeof ONLINE_ALL>(ONLINE_ALL);
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<AdminDriver | null>(null);

  const extra: Record<string, string> = {};
  if (kyc !== ALL) extra.kycStatus = kyc;
  if (online !== ONLINE_ALL) extra.online = online;

  const { data, pagination, isLoading, isError, error, refetch } =
    useAdminQuery<AdminDriversListResponse>({
      path: "/admin/drivers",
      params: {
        search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        extra: Object.keys(extra).length ? extra : undefined,
      },
    });

  const rows = data ?? [];

  const cols: Column<AdminDriver>[] = [
    {
      key: "name",
      header: "Livreur",
      cell: (d) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{initialsOf(d.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-on-surface">{d.name || "—"}</div>
            <div className="truncate text-[11px] text-on-surface-variant">{d.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Véhicule",
      cell: (d) => (
        <span className="inline-flex items-center gap-1 text-[13px] text-on-surface-variant">
          <Bike className="h-3.5 w-3.5" />
          {d.vehicleType ? VEHICLE_LABEL[d.vehicleType] : "—"}
        </span>
      ),
    },
    { key: "kyc", header: "KYC", cell: (d) => <KycStatusBadge status={d.kycStatus} /> },
    { key: "online", header: "Statut", cell: (d) => <OnlineBadge online={d.isOnline} /> },
    {
      key: "deliveries",
      header: "Livraisons",
      align: "right",
      cell: (d) => <span className="tabular-nums">{formatNum(d.totalDeliveries)}</span>,
    },
    {
      key: "rating",
      header: "Note",
      cell: (d) =>
        d.averageRating != null ? (
          <span className="inline-flex items-center gap-1 text-[13px]">
            <Star className="h-3.5 w-3.5 text-warning" />
            {d.averageRating.toFixed(1)}
          </span>
        ) : (
          <span className="text-on-surface-variant">—</span>
        ),
    },
    {
      key: "zones",
      header: "Zones",
      cell: (d) => (
        <span className="text-[12px] text-on-surface-variant">
          {d.zones.length ? d.zones.slice(0, 2).join(", ") + (d.zones.length > 2 ? ` +${d.zones.length - 2}` : "") : "—"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Inscrit le",
      cell: (d) => <span className="text-[12px] text-on-surface-variant">{formatDateFr(d.createdAt)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un livreur…"
            className="pl-8"
          />
        </div>
        <Select value={kyc} onValueChange={(v) => { setKyc(v as KycStatus | typeof ALL); setPage(1); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="KYC" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les KYC</SelectItem>
            {KYC_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={online} onValueChange={(v) => { setOnline(v as "true" | "false" | typeof ONLINE_ALL); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ONLINE_ALL}>Tous</SelectItem>
            <SelectItem value="true">En ligne</SelectItem>
            <SelectItem value="false">Hors ligne</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(d) => d.id}
        onRowClick={(d) => setActive(d)}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        emptyLabel="Aucun livreur."
        serverPagination={{ pagination, page, onPageChange: setPage, pageSize: PAGE_SIZE }}
      />

      <DriverDrawer driver={active} onClose={() => setActive(null)} />
    </div>
  );
}
