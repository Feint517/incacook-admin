import { Badge } from "@/components/ui/badge";
import { UserStatusBadge } from "@/components/dashboard/status-badge";

export type VehicleType = "BICYCLE" | "SCOOTER" | "CAR";
export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminDriver {
  id: string;
  name: string;
  email: string;
  vehicleType: VehicleType | null;
  kycStatus: KycStatus;
  isOnline: boolean;
  lastSeenAt: string | null;
  averageRating: number | null;
  totalDeliveries: number;
  stripeOnboardingCompleted: boolean;
  zones: string[];
  isSuspended: boolean;
  createdAt: string;
}

export type AdminDriversListResponse = AdminDriver[];

export const VEHICLE_LABEL: Record<VehicleType, string> = {
  BICYCLE: "Vélo",
  SCOOTER: "Scooter",
  CAR: "Voiture",
};

const KYC_LABEL: Record<KycStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Vérifié",
  REJECTED: "Rejeté",
};
const KYC_VARIANT: Record<KycStatus, "warning" | "success" | "error"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

export const KYC_OPTIONS: { value: KycStatus; label: string }[] = [
  { value: "PENDING", label: KYC_LABEL.PENDING },
  { value: "APPROVED", label: KYC_LABEL.APPROVED },
  { value: "REJECTED", label: KYC_LABEL.REJECTED },
];

export function KycStatusBadge({ status }: { status: KycStatus }) {
  return <Badge variant={KYC_VARIANT[status]}>{KYC_LABEL[status]}</Badge>;
}

export function OnlineBadge({ online }: { online: boolean }) {
  return online ? (
    <Badge variant="success">En ligne</Badge>
  ) : (
    <Badge variant="neutral">Hors ligne</Badge>
  );
}

export function DriverStatus({ driver }: { driver: AdminDriver }) {
  return <UserStatusBadge status={driver.isSuspended ? "suspended" : "verified"} />;
}

export function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
