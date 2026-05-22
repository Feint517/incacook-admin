import { Badge } from "@/components/ui/badge";
import type { OrderStatus, UserStatus, ListingStatus, ReportStatus } from "@/lib/mock-data/types";

const ORDER_LABEL: Record<OrderStatus, string> = {
  new: "Nouvelle",
  accepted: "Acceptée",
  preparing: "En préparation",
  ready: "Prête",
  delivering: "En livraison",
  completed: "Livrée",
  cancelled: "Annulée",
};

const ORDER_VARIANT: Record<OrderStatus, "info" | "primary" | "warning" | "success" | "error" | "neutral"> = {
  new: "info",
  accepted: "info",
  preparing: "warning",
  ready: "primary",
  delivering: "primary",
  completed: "success",
  cancelled: "error",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={ORDER_VARIANT[status]}>{ORDER_LABEL[status]}</Badge>;
}

const USER_LABEL: Record<UserStatus, string> = {
  verified: "Vérifié",
  pending: "En attente",
  suspended: "Suspendu",
};

const USER_VARIANT: Record<UserStatus, "success" | "warning" | "error"> = {
  verified: "success",
  pending: "warning",
  suspended: "error",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant={USER_VARIANT[status]}>{USER_LABEL[status]}</Badge>;
}

const LISTING_LABEL: Record<ListingStatus, string> = {
  active: "Active",
  "sold-out": "Épuisée",
  expired: "Expirée",
  paused: "En pause",
};

const LISTING_VARIANT: Record<ListingStatus, "success" | "neutral" | "error" | "warning"> = {
  active: "success",
  "sold-out": "neutral",
  expired: "error",
  paused: "warning",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <Badge variant={LISTING_VARIANT[status]}>{LISTING_LABEL[status]}</Badge>;
}

const REPORT_LABEL: Record<ReportStatus, string> = {
  open: "Ouvert",
  review: "En revue",
  resolved: "Résolu",
};

const REPORT_VARIANT: Record<ReportStatus, "error" | "warning" | "success"> = {
  open: "error",
  review: "warning",
  resolved: "success",
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge variant={REPORT_VARIANT[status]}>{REPORT_LABEL[status]}</Badge>;
}
