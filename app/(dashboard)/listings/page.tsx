import { PageShell } from "@/components/dashboard/page-shell";
import { ListingsClient } from "./_components/listings-client";

export default function ListingsPage() {
  return (
    <PageShell title="Annonces" subtitle="Plats publiés sur la plateforme">
      <ListingsClient />
    </PageShell>
  );
}
