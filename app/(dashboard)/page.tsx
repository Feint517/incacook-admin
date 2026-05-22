import { PageShell } from "@/components/dashboard/page-shell";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { OverviewActivityChart } from "./_components/overview-activity-chart";
import { activityOverTime, orders, users } from "@/lib/mock-data/generator";
import { formatNum } from "@/lib/utils";

export default function OverviewPage() {
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const last14Trend = activityOverTime.slice(-14);

  return (
    <PageShell title="Vue d'ensemble" subtitle="Santé de la plateforme en un coup d'œil">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <KpiCard
          label="Utilisateurs"
          value={formatNum(totalUsers)}
          delta={8.2}
          trend={last14Trend.map((d) => ({ v: d.users }))}
          accent="info"
        />
        <KpiCard
          label="Commandes"
          value={formatNum(totalOrders)}
          delta={12.5}
          trend={last14Trend.map((d) => ({ v: d.orders }))}
          accent="primary"
        />
      </div>

      <div className="mt-3">
        <OverviewActivityChart data={activityOverTime} />
      </div>
    </PageShell>
  );
}
