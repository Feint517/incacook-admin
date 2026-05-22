import { PageShell } from "@/components/dashboard/page-shell";
import { ListingsClient } from "./_components/listings-client";
import { listings } from "@/lib/mock-data/generator";

export default function ListingsPage() {
  const active = listings.filter((l) => l.status === "active").length;
  const today = listings.filter(
    (l) => Date.now() - +new Date(l.expiresAt) > -5 * 86400000 && Date.now() - +new Date(l.expiresAt) < 86400000,
  ).length;
  const soldOutDay = listings.filter((l) => l.status === "sold-out").length;
  const avgPrices = (["faitMaison", "traiteur", "restaurant"] as const).map((cat) => {
    const set = listings.filter((l) => l.category === cat);
    return {
      cat,
      avg: set.reduce((s, l) => s + l.price, 0) / Math.max(1, set.length),
    };
  });

  return (
    <PageShell title="Annonces" subtitle="Plats publiés sur la plateforme">
      <ListingsClient
        listings={listings}
        stats={{ active, today, soldOutDay, avgPrices }}
      />
    </PageShell>
  );
}
