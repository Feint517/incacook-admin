import { PageShell } from "@/components/dashboard/page-shell";
import { SellersClient } from "./_components/sellers-client";
import { sellers } from "@/lib/mock-data/generator";

export default function SellersPage() {
  const newWeek = sellers.filter((s) => Date.now() - +new Date(s.joined) < 7 * 86400000).length;
  const avgRating =
    sellers.reduce((s, x) => s + x.rating * x.ratingCount, 0) /
    Math.max(1, sellers.reduce((s, x) => s + x.ratingCount, 0));
  const premiums = sellers.filter((s) => s.subscriptionTier !== "free").length;

  return (
    <PageShell title="Vendeurs" subtitle="Performance et profils des vendeurs">
      <SellersClient
        sellers={sellers}
        stats={{
          active: sellers.length,
          newWeek,
          avgRating,
          premiums,
        }}
      />
    </PageShell>
  );
}
