import { Badge } from "@/components/ui/badge";
import type { SellerCategory } from "@/lib/mock-data/types";

const LABEL: Record<SellerCategory, string> = {
  faitMaison: "Fait Maison",
  traiteur: "Traiteur",
  restaurant: "Restaurant",
};

const VARIANT: Record<SellerCategory, "primary" | "secondary" | "info"> = {
  faitMaison: "primary",
  traiteur: "secondary",
  restaurant: "info",
};

export function CategoryBadge({ category, className }: { category: SellerCategory; className?: string }) {
  return (
    <Badge variant={VARIANT[category]} className={className}>
      {LABEL[category]}
    </Badge>
  );
}
