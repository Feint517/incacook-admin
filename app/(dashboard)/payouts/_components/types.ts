export type UserRole = "BUYER" | "SELLER" | "DRIVER" | "ADMIN" | "MODERATOR";

export interface WalletBalance {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  availableCents: number;
  pendingCents: number;
  heldCents: number;
  paidOutCents: number;
  currency: string;
}
export type WalletBalancesResponse = WalletBalance[];

export type WithdrawalStatus =
  | "PENDING"
  | "AVAILABLE"
  | "HELD"
  | "PAID_OUT"
  | "CANCELLED";

export interface Withdrawal {
  id: string;
  withdrawalId: string | null;
  userId: string;
  name: string;
  amountCents: number;
  status: WithdrawalStatus;
  transferId: string | null;
  createdAt: string;
}
export type WithdrawalsResponse = Withdrawal[];

export const ROLE_LABEL: Partial<Record<UserRole, string>> = {
  SELLER: "Vendeur",
  DRIVER: "Livreur",
};

export const WITHDRAWAL_STATUS_LABEL: Record<WithdrawalStatus, string> = {
  PENDING: "En attente",
  AVAILABLE: "Disponible",
  HELD: "Bloqué",
  PAID_OUT: "Versé",
  CANCELLED: "Annulé",
};

export const WITHDRAWAL_STATUS_VARIANT: Record<
  WithdrawalStatus,
  "warning" | "info" | "error" | "success" | "neutral"
> = {
  PENDING: "warning",
  AVAILABLE: "info",
  HELD: "error",
  PAID_OUT: "success",
  CANCELLED: "neutral",
};
