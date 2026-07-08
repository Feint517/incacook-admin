import { PageShell } from "@/components/dashboard/page-shell";
import { SubscriptionsClient } from "./_components/subscriptions-client";

export default function SubscriptionsPage() {
  return (
    <PageShell
      title="Abonnements vendeurs"
      subtitle="Suivi des abonnements plateforme (Stripe / RevenueCat)"
    >
      <SubscriptionsClient />
    </PageShell>
  );
}
