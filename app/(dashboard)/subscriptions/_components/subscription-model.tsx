import { Badge } from "@/components/ui/badge";

export type SubscriptionStatus =
  | "NONE"
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED"
  | "UNPAID"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED";

export type SubscriptionProvider = "stripe" | "revenuecat" | "none";
export type SellerCategory = "FAIT_MAISON" | "TRAITEUR" | "RESTAURANT";

export interface AdminSubscription {
  sellerId: string;
  name: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  plan: string | null;
  isPremium: boolean;
  category: SellerCategory | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  provider: SubscriptionProvider;
  createdAt: string;
}

export type AdminSubscriptionsListResponse = AdminSubscription[];

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  NONE: "Aucun",
  ACTIVE: "Actif",
  TRIALING: "Essai",
  PAST_DUE: "Retard de paiement",
  CANCELED: "Annulé",
  EXPIRED: "Expiré",
  UNPAID: "Impayé",
  INCOMPLETE: "Incomplet",
  INCOMPLETE_EXPIRED: "Incomplet expiré",
};

const STATUS_VARIANT: Record<
  SubscriptionStatus,
  "success" | "info" | "warning" | "error" | "neutral"
> = {
  NONE: "neutral",
  ACTIVE: "success",
  TRIALING: "info",
  PAST_DUE: "warning",
  CANCELED: "neutral",
  EXPIRED: "error",
  UNPAID: "error",
  INCOMPLETE: "warning",
  INCOMPLETE_EXPIRED: "error",
};

export const STATUS_OPTIONS = (
  Object.keys(STATUS_LABEL) as SubscriptionStatus[]
).map((s) => ({ value: s, label: STATUS_LABEL[s] }));

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}

const PROVIDER_LABEL: Record<SubscriptionProvider, string> = {
  stripe: "Stripe",
  revenuecat: "RevenueCat",
  none: "—",
};

export function ProviderBadge({ provider }: { provider: SubscriptionProvider }) {
  if (provider === "none") return <span className="text-on-surface-variant">—</span>;
  return <Badge variant="neutral">{PROVIDER_LABEL[provider]}</Badge>;
}

export function planLabel(sub: AdminSubscription): string {
  if (sub.plan) return sub.plan === "PREMIUM" ? "Premium" : "Standard";
  return sub.isPremium ? "Premium" : "—";
}
