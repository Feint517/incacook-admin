import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/lib/mock-data/types";

const LABEL: Record<UserRole, string> = {
  buyer: "Acheteur",
  "seller-faitMaison": "Vendeur · Fait Maison",
  "seller-traiteur": "Vendeur · Traiteur",
  "seller-restaurant": "Vendeur · Restaurant",
  driver: "Livreur",
};

const VARIANT: Record<UserRole, "neutral" | "primary" | "secondary" | "info" | "warning"> = {
  buyer: "neutral",
  "seller-faitMaison": "primary",
  "seller-traiteur": "secondary",
  "seller-restaurant": "info",
  driver: "warning",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={VARIANT[role]}>{LABEL[role]}</Badge>;
}
