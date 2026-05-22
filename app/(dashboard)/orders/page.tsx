import { PageShell } from "@/components/dashboard/page-shell";
import { OrdersClient } from "./_components/orders-client";
import { orders } from "@/lib/mock-data/generator";

export default function OrdersPage() {
  const today = orders.filter((o) => Date.now() - +new Date(o.date) < 86400000);
  const active = orders.filter((o) =>
    ["new", "accepted", "preparing", "ready", "delivering"].includes(o.status),
  );
  const avg = orders.reduce((s, o) => s + o.total, 0) / Math.max(1, orders.length);
  const awaiting = orders.filter((o) => ["preparing", "ready"].includes(o.status)).length;

  return (
    <PageShell title="Commandes" subtitle="Toutes les transactions de la plateforme">
      <OrdersClient
        orders={orders}
        stats={{
          today: today.length,
          active: active.length,
          avg,
          awaiting,
        }}
      />
    </PageShell>
  );
}
