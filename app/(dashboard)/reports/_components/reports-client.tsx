"use client";

import { useMemo, useState } from "react";
import { Flag, CheckCircle2, Clock, AlertOctagon } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { ReportStatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportDrawer } from "./report-drawer";
import { formatNum, formatDateFr } from "@/lib/utils";
import type { Report } from "@/lib/mock-data/types";

interface Props {
  reports: Report[];
  stats: { open: number; resolvedThisWeek: number; avgResolution: string; repeatOffenders: number };
}

export function ReportsClient({ reports, stats }: Props) {
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [active, setActive] = useState<Report | null>(null);

  const filtered = useMemo(
    () =>
      reports.filter((r) => {
        if (tab !== "all" && r.type !== tab) return false;
        if (status !== "all" && r.status !== status) return false;
        if (severity !== "all" && r.severity !== severity) return false;
        return true;
      }),
    [reports, tab, status, severity],
  );

  const cols: Column<Report>[] = [
    {
      key: "id",
      header: "ID",
      cell: (r) => <span className="font-mono text-[12px] text-on-surface-variant">{r.id}</span>,
      width: "100px",
    },
    {
      key: "date",
      header: "Date",
      cell: (r) => <span className="text-[12px] text-on-surface-variant">{formatDateFr(r.date)}</span>,
      width: "110px",
    },
    {
      key: "type",
      header: "Type",
      cell: (r) => <Badge variant={r.type === "Hygiène" ? "error" : "warning"}>{r.type}</Badge>,
      width: "150px",
    },
    {
      key: "entity",
      header: "Entité signalée",
      cell: (r) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-on-surface">{r.entityName}</div>
          <div className="text-[10.5px] uppercase tracking-wider text-on-surface-variant">
            {r.entityType === "listing" ? "Annonce" : "Vendeur"}
          </div>
        </div>
      ),
    },
    {
      key: "reporter",
      header: "Auteur",
      cell: (r) => <span className="text-[12px] text-on-surface-variant">{r.reporter}</span>,
      width: "80px",
    },
    {
      key: "status",
      header: "Statut",
      cell: (r) => <ReportStatusBadge status={r.status} />,
      width: "120px",
    },
    {
      key: "severity",
      header: "Sévérité",
      cell: (r) => (
        <Badge
          variant={r.severity === "high" ? "error" : r.severity === "medium" ? "warning" : "neutral"}
        >
          {r.severity === "high" ? "Élevée" : r.severity === "medium" ? "Moyenne" : "Faible"}
        </Badge>
      ),
      width: "110px",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Signalements ouverts" value={formatNum(stats.open)} icon={Flag} accent="error" />
        <StatCard label="Résolus cette semaine" value={formatNum(stats.resolvedThisWeek)} icon={CheckCircle2} accent="success" />
        <StatCard label="Temps moyen de résolution" value={stats.avgResolution} icon={Clock} accent="info" />
        <StatCard label="Récidivistes" value={formatNum(stats.repeatOffenders)} icon={AlertOctagon} accent="warning" />
      </div>

      <div className="frost mt-4 flex flex-wrap items-center gap-2 rounded-md p-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="Hygiène">Hygiène</TabsTrigger>
            <TabsTrigger value="Non fait maison">Non fait maison</TabsTrigger>
            <TabsTrigger value="Autre">Autre</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="open">Ouverts</SelectItem>
              <SelectItem value="review">En revue</SelectItem>
              <SelectItem value="resolved">Résolus</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Sévérité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="high">Élevée</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3">
        <DataTable
          columns={cols}
          rows={filtered}
          rowKey={(r) => r.id}
          onRowClick={(r) => setActive(r)}
          pageSize={12}
        />
      </div>

      <ReportDrawer report={active} reports={reports} onClose={() => setActive(null)} />
    </>
  );
}
