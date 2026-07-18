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

// --- Withdrawal reconciliation (issue #7/#12) -------------------------------
// GET /admin/withdrawals/reconcile — deliberately NOT a paginated list
// endpoint (no hasMore/total/page), so the backend's TransformInterceptor
// does not unwrap `items` the way it does for /admin/withdrawals — the
// response body stays `{ items: [...] }` and must be unwrapped here.

export type ReconcileIssue =
  | "ok"
  | "missing_transfer_id"
  | "transfer_not_found"
  | "amount_mismatch"
  | "reversed_uncovered";

export interface ReconcileItem {
  withdrawalId: string;
  userId: string;
  ledgerAmountCents: number;
  transferId: string | null;
  issue: ReconcileIssue;
  stripeAmountCents?: number;
  amountReversedCents?: number;
}

export interface ReconcileResponse {
  items: ReconcileItem[];
}

export const RECONCILE_ISSUE_LABEL: Record<ReconcileIssue, string> = {
  ok: "OK",
  missing_transfer_id: "ID transfert manquant",
  transfer_not_found: "Transfert introuvable",
  amount_mismatch: "Montant incohérent",
  reversed_uncovered: "Remboursement non couvert",
};

export const RECONCILE_ISSUE_VARIANT: Record<
  ReconcileIssue,
  "success" | "warning" | "error" | "neutral"
> = {
  ok: "success",
  missing_transfer_id: "warning",
  transfer_not_found: "error",
  amount_mismatch: "error",
  reversed_uncovered: "warning",
};
