import { PageShell } from "@/components/dashboard/page-shell";
import { SellersClient } from "./_components/sellers-client";

export default function SellersPage() {
  return (
    <PageShell title="Vendeurs" subtitle="Performance et profils des vendeurs">
      <SellersClient />
    </PageShell>
  );
}
