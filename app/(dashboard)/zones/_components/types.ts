// Local wire types for driver/delivery zone management (GET /v1/zones/all etc.).

export interface Zone {
  id: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
  city: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ZonesListResponse = Zone[];

export interface CreateZoneBody {
  name: string;
  isActive?: boolean;
  displayOrder?: number;
  city?: string;
  lat?: number;
  lng?: number;
}

export type UpdateZoneBody = Partial<CreateZoneBody>;
