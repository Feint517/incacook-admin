import { PageShell } from "@/components/dashboard/page-shell";
import { OrdersClient } from "./_components/orders-client";

export default function OrdersPage() {
  return (
    <PageShell
      title="Commandes"
      subtitle="Toutes les transactions de la plateforme"
    >
      <OrdersClient />
    </PageShell>
  );
}
