import { PageShell } from "@/components/dashboard/page-shell";
import { PayoutsClient } from "./_components/payouts-client";

export default function PayoutsPage() {
  return (
    <PageShell
      title="Portefeuilles & versements"
      subtitle="Soldes vendeurs/livreurs et historique des versements Stripe"
    >
      <PayoutsClient />
    </PageShell>
  );
}
