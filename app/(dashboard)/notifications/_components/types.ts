// Local wire types for the admin broadcast-notification form, mirroring
// IncaCook-Server SendAdminNotificationDto + AdminNotificationResult.

export type NotificationTarget =
  | "ALL"
  | "BUYERS"
  | "SELLERS"
  | "DRIVERS"
  | "RECURRING_USERS"
  | "MONO_USERS"
  | "TOP_SELLERS"
  | "CATEGORY"
  | "CITY";

export type SellerCategory = "FAIT_MAISON" | "TRAITEUR" | "RESTAURANT";

/** Body for POST /v1/admin/notifications/send. */
export interface SendNotificationInput {
  target: NotificationTarget;
  category?: SellerCategory;
  city?: string;
  title: string;
  body: string;
}

/** Delivery counts returned by the send endpoint. */
export interface NotificationResult {
  target: NotificationTarget;
  targetedUsers: number;
  sent: number;
  failed: number;
}

export const TARGET_LABELS: Record<NotificationTarget, string> = {
  ALL: "Tous les utilisateurs",
  BUYERS: "Acheteurs",
  SELLERS: "Vendeurs",
  DRIVERS: "Livreurs",
  RECURRING_USERS: "Utilisateurs récurrents",
  MONO_USERS: "Utilisateurs mono-transaction",
  TOP_SELLERS: "Meilleurs vendeurs",
  CATEGORY: "Par catégorie de vendeur",
  CITY: "Par ville",
};

export const TARGET_ORDER: NotificationTarget[] = [
  "ALL",
  "BUYERS",
  "SELLERS",
  "DRIVERS",
  "RECURRING_USERS",
  "MONO_USERS",
  "TOP_SELLERS",
  "CATEGORY",
  "CITY",
];

export const CATEGORY_LABELS: Record<SellerCategory, string> = {
  FAIT_MAISON: "Fait maison",
  TRAITEUR: "Traiteur",
  RESTAURANT: "Restaurant",
};

export const TITLE_MAX = 120;
export const BODY_MAX = 500;
