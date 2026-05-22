export type SellerCategory = "faitMaison" | "traiteur" | "restaurant";
export type UserRole = "buyer" | "seller-faitMaison" | "seller-traiteur" | "seller-restaurant" | "driver";
export type UserStatus = "verified" | "pending" | "suspended";
export type OrderStatus = "new" | "accepted" | "preparing" | "ready" | "delivering" | "completed" | "cancelled";
export type Fulfillment = "delivery" | "pickup";
export type CuisineType = "Orientale" | "Française" | "Africaine" | "Portugaise" | "Italienne" | "Espagnole" | "Latine";
export type Diet = "Halal" | "Végan" | "Sans gluten" | "Casher";
export type DishType = "Entrée" | "Plat" | "Desserts" | "Cocktail dinatoire";
export type ListingStatus = "active" | "sold-out" | "expired" | "paused";
export type ReportType = "Hygiène" | "Non fait maison" | "Qualité" | "Emballage" | "Autre";
export type ReportStatus = "open" | "review" | "resolved";
export type SubTier = "free" | "standard" | "premium";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  city: string;
  joined: string;
  totalTransactions: number;
  status: UserStatus;
  lastActive: string;
  charterSigned?: boolean;
  idVerified?: boolean;
}

export interface Seller extends User {
  category: SellerCategory;
  rating: number;
  ratingCount: number;
  totalSales: number;
  totalRevenue: number;
  hygieneOk: boolean;
  qualityScore: number;
  packagingScore: number;
  activeListings: number;
  subscriptionTier: SubTier;
}

export interface Listing {
  id: string;
  title: string;
  category: SellerCategory;
  cuisine: CuisineType;
  diets: Diet[];
  dishType?: DishType;
  photo: string;
  price: number;
  portionsLeft: number;
  portionsTotal: number;
  expiresAt: string;
  status: ListingStatus;
  sellerId: string;
  sellerName: string;
  reportCount: number;
  orderCount: number;
}

export interface Order {
  id: string;
  date: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  category: SellerCategory;
  itemCount: number;
  total: number;
  fulfillment: Fulfillment;
  status: OrderStatus;
  driverId?: string;
  driverName?: string;
  city: string;
}

export interface Report {
  id: string;
  date: string;
  type: ReportType;
  entityType: "listing" | "seller";
  entityId: string;
  entityName: string;
  reporter: string;
  status: ReportStatus;
  severity: "low" | "medium" | "high";
  content: string;
  resolutionNotes?: string;
}

export interface CityStat {
  city: string;
  lat: number;
  lng: number;
  orders: number;
  sellers: number;
  buyers: number;
  drivers: number;
  revenue: number;
}
