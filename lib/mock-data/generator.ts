import type {
  User,
  Seller,
  Listing,
  Order,
  Report,
  CityStat,
  SellerCategory,
  CuisineType,
  Diet,
  OrderStatus,
  ListingStatus,
  ReportType,
  ReportStatus,
  UserStatus,
  SubTier,
  Fulfillment,
} from "./types";

const FIRST_NAMES = [
  "Fatima", "Karim", "Marie", "Mohamed", "Sophie", "Yacine", "Léa", "Ahmed", "Camille", "Hassan",
  "Inès", "Mehdi", "Nadia", "Omar", "Sarah", "Tariq", "Zineb", "Lucas", "Emma", "Hugo",
  "Aïcha", "Bilal", "Chloé", "Dounia", "Elias", "Farah", "Gabriel", "Hanane", "Imane", "Julien",
  "Khadija", "Linda", "Malik", "Nour", "Olivier", "Pauline", "Rachid", "Salima", "Théo", "Yasmine",
];

const LAST_NAMES = [
  "Benali", "Martin", "Bernard", "El Amrani", "Dubois", "Cherif", "Petit", "Mansouri", "Robert",
  "Khelifi", "Richard", "Bouchard", "Touati", "Moreau", "Lambert", "Hadjadj", "Lefebvre", "Saidi",
  "Garcia", "Rodriguez", "Costa", "Ferreira", "Da Silva", "Müller", "Rossi", "Belkacem", "Nguyen",
];

const CITIES: { name: string; lat: number; lng: number; weight: number }[] = [
  { name: "Paris", lat: 48.8566, lng: 2.3522, weight: 100 },
  { name: "Lyon", lat: 45.7640, lng: 4.8357, weight: 60 },
  { name: "Marseille", lat: 43.2965, lng: 5.3698, weight: 70 },
  { name: "Toulouse", lat: 43.6047, lng: 1.4442, weight: 45 },
  { name: "Bordeaux", lat: 44.8378, lng: -0.5792, weight: 40 },
  { name: "Lille", lat: 50.6292, lng: 3.0573, weight: 38 },
  { name: "Nantes", lat: 47.2184, lng: -1.5536, weight: 35 },
  { name: "Strasbourg", lat: 48.5734, lng: 7.7521, weight: 30 },
  { name: "Nice", lat: 43.7102, lng: 7.2620, weight: 32 },
  { name: "Montpellier", lat: 43.6109, lng: 3.8772, weight: 28 },
  { name: "Rennes", lat: 48.1173, lng: -1.6778, weight: 22 },
  { name: "Grenoble", lat: 45.1885, lng: 5.7245, weight: 20 },
  { name: "Reims", lat: 49.2583, lng: 4.0317, weight: 16 },
  { name: "Toulon", lat: 43.1242, lng: 5.928, weight: 18 },
  { name: "Saint-Étienne", lat: 45.4397, lng: 4.3872, weight: 14 },
];

const CUISINES: CuisineType[] = ["Orientale", "Française", "Africaine", "Portugaise", "Italienne", "Espagnole", "Latine"];
const DIETS: Diet[] = ["Halal", "Végan", "Sans gluten", "Casher"];
const CATEGORIES: SellerCategory[] = ["faitMaison", "traiteur", "restaurant"];

const DISH_NAMES_BY_CUISINE: Record<CuisineType, string[]> = {
  Orientale: ["Tajine d'agneau aux pruneaux", "Couscous royal", "Pastilla au poulet", "Harira maison", "Méchoui", "Briouates aux amandes"],
  Française: ["Blanquette de veau", "Pot-au-feu", "Bœuf bourguignon", "Quiche lorraine", "Hachis parmentier", "Ratatouille provençale"],
  Africaine: ["Yassa poulet", "Mafé bœuf", "Thieboudienne", "Poulet DG", "Aloko crevettes", "Ndolé"],
  Portugaise: ["Bacalhau à brás", "Francesinha", "Caldo verde", "Pastéis de nata", "Arroz de pato"],
  Italienne: ["Lasagnes maison", "Risotto aux champignons", "Osso buco", "Tiramisu artisanal", "Parmigiana"],
  Espagnole: ["Paella valencienne", "Tortilla española", "Gaspacho andalou", "Empanadas"],
  Latine: ["Empanadas argentines", "Ceviche péruvien", "Arroz con pollo", "Tamales", "Pabellón criollo"],
};

const PRESET_PHOTOS = [
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
  "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
  "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400",
  "https://images.unsplash.com/photo-1559054663-e8d23213f55c?w=400",
  "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400",
  "https://images.unsplash.com/photo-1604908554007-0e7c0bf2cc18?w=400",
  "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400",
];

// Deterministic PRNG (so SSR/CSR match)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260506);
const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];
const pickWeighted = <T extends { weight: number }>(arr: T[]) => {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let r = rng() * total;
  for (const x of arr) {
    r -= x.weight;
    if (r <= 0) return x;
  }
  return arr[0];
};
const between = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const betweenF = (min: number, max: number) => rng() * (max - min) + min;
const id = (prefix: string, n: number) => `${prefix}_${n.toString().padStart(5, "0")}`;
const daysAgo = (d: number) => new Date(Date.UTC(2026, 4, 6) - d * 86400000).toISOString();
const minutesAgo = (m: number) => new Date(Date.UTC(2026, 4, 6, 14, 0) - m * 60000).toISOString();
const fullName = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

function avatarFor(name: string) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=00C263,C8553D,F0E5DC,FFC107`;
}

// ----------------- USERS / SELLERS -----------------

const users: User[] = [];
const sellers: Seller[] = [];

const ROLE_DIST = [
  { role: "buyer" as const, weight: 70 },
  { role: "seller-faitMaison" as const, weight: 12 },
  { role: "seller-traiteur" as const, weight: 5 },
  { role: "seller-restaurant" as const, weight: 8 },
  { role: "driver" as const, weight: 5 },
];

for (let i = 0; i < 240; i++) {
  const name = fullName();
  const role = pickWeighted(ROLE_DIST).role;
  const city = pickWeighted(CITIES).name;
  const joinedDays = between(0, 365);
  const status: UserStatus = rng() < 0.85 ? "verified" : rng() < 0.6 ? "pending" : "suspended";
  const totalTx = role === "buyer" ? between(0, 25) : role === "driver" ? between(0, 200) : between(0, 80);

  const u: User = {
    id: id("u", i + 1),
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@${pick(["gmail.com", "outlook.fr", "hotmail.fr", "yahoo.fr"])}`,
    avatar: avatarFor(name),
    role,
    city,
    joined: daysAgo(joinedDays),
    totalTransactions: totalTx,
    status,
    lastActive: minutesAgo(between(0, 60 * 24 * 30)),
    charterSigned: rng() < 0.92,
    idVerified: rng() < 0.78,
  };
  users.push(u);

  if (role.startsWith("seller-")) {
    const category: SellerCategory =
      role === "seller-faitMaison" ? "faitMaison" :
      role === "seller-traiteur" ? "traiteur" : "restaurant";
    sellers.push({
      ...u,
      category,
      rating: +(3.8 + rng() * 1.2).toFixed(1),
      ratingCount: between(0, 320),
      totalSales: totalTx * between(1, 4),
      totalRevenue: totalTx * between(8, 35),
      hygieneOk: rng() < 0.94,
      qualityScore: +(3.5 + rng() * 1.5).toFixed(1),
      packagingScore: +(3.2 + rng() * 1.7).toFixed(1),
      activeListings: between(0, 14),
      subscriptionTier: (rng() < 0.55 ? "free" : rng() < 0.7 ? "standard" : "premium") as SubTier,
    });
  }
}

// ----------------- LISTINGS -----------------

const listings: Listing[] = [];
for (let i = 0; i < 220; i++) {
  const seller = pick(sellers);
  const cuisine = pick(CUISINES);
  const dishName = pick(DISH_NAMES_BY_CUISINE[cuisine]);
  const portionsTotal = between(2, 14);
  const portionsLeft = between(0, portionsTotal);
  const status: ListingStatus =
    portionsLeft === 0 ? "sold-out" :
    rng() < 0.05 ? "expired" :
    rng() < 0.04 ? "paused" : "active";
  const priceCap = seller.category === "faitMaison" ? 4.5 : 12;
  const priceMin = seller.category === "faitMaison" ? 2.5 : 4;
  const diets: Diet[] = [];
  if (rng() < 0.35) diets.push("Halal");
  if (rng() < 0.10) diets.push("Végan");
  if (rng() < 0.06) diets.push("Sans gluten");
  if (rng() < 0.04) diets.push("Casher");

  let dishType: Listing["dishType"] = undefined;
  if (seller.category === "traiteur") {
    const types: Listing["dishType"][] = ["Entrée", "Plat", "Desserts", "Cocktail dinatoire"];
    dishType = types[between(0, 3)];
  } else if (seller.category === "restaurant") {
    const types: Listing["dishType"][] = ["Entrée", "Plat", "Desserts"];
    dishType = types[between(0, 2)];
  }

  listings.push({
    id: id("l", i + 1),
    title: dishName,
    category: seller.category,
    cuisine,
    diets,
    dishType,
    photo: pick(PRESET_PHOTOS),
    price: +betweenF(priceMin, priceCap).toFixed(2),
    portionsLeft,
    portionsTotal,
    expiresAt: minutesAgo(-between(60, 60 * 24 * 5)),
    status,
    sellerId: seller.id,
    sellerName: seller.name,
    reportCount: rng() < 0.08 ? between(1, 4) : 0,
    orderCount: between(0, 30),
  });
}

// ----------------- ORDERS -----------------

const ORDER_STATUS_DIST: { status: OrderStatus; weight: number }[] = [
  { status: "completed", weight: 70 },
  { status: "delivering", weight: 6 },
  { status: "ready", weight: 4 },
  { status: "preparing", weight: 6 },
  { status: "accepted", weight: 4 },
  { status: "new", weight: 3 },
  { status: "cancelled", weight: 7 },
];

const buyers = users.filter((u) => u.role === "buyer");
const drivers = users.filter((u) => u.role === "driver");
const orders: Order[] = [];
for (let i = 0; i < 600; i++) {
  const seller = pick(sellers);
  const buyer = pick(buyers);
  const fulfillment: Fulfillment = rng() < 0.65 ? "delivery" : "pickup";
  const driver = fulfillment === "delivery" ? pick(drivers) : undefined;
  const itemCount = between(1, 4);
  const unitPrice = betweenF(seller.category === "faitMaison" ? 2.5 : 4, seller.category === "faitMaison" ? 4.5 : 11);
  const subtotal = itemCount * unitPrice;
  const deliveryFee = fulfillment === "delivery" ? betweenF(1.5, 4.5) : 0;
  const status = pickWeighted(ORDER_STATUS_DIST).status;

  orders.push({
    id: id("o", i + 1),
    date: minutesAgo(between(0, 60 * 24 * 60)),
    buyerId: buyer.id,
    buyerName: buyer.name,
    sellerId: seller.id,
    sellerName: seller.name,
    category: seller.category,
    itemCount,
    total: +(subtotal + deliveryFee).toFixed(2),
    fulfillment,
    status,
    driverId: driver?.id,
    driverName: driver?.name,
    city: pickWeighted(CITIES).name,
  });
}
orders.sort((a, b) => +new Date(b.date) - +new Date(a.date));

// ----------------- REPORTS -----------------

const REPORT_TYPES: ReportType[] = ["Hygiène", "Non fait maison", "Qualité", "Emballage", "Autre"];
const reports: Report[] = [];
for (let i = 0; i < 64; i++) {
  const useListing = rng() < 0.6;
  const target = useListing ? pick(listings) : pick(sellers);
  const status: ReportStatus = rng() < 0.55 ? "resolved" : rng() < 0.7 ? "review" : "open";
  const reporterName = fullName();
  const initials = reporterName.split(" ").map((w) => w[0]).join("");
  const type = pick(REPORT_TYPES);
  const repCount = between(1, 5);
  reports.push({
    id: id("r", i + 1),
    date: daysAgo(between(0, 90)),
    type,
    entityType: useListing ? "listing" : "seller",
    entityId: (target as Listing | Seller).id,
    entityName: useListing ? (target as Listing).title : (target as Seller).name,
    reporter: initials,
    status,
    severity: repCount >= 3 ? "high" : repCount === 2 ? "medium" : "low",
    content: pick([
      "Le repas semblait avoir été acheté en magasin et reconditionné.",
      "Hygiène douteuse, l'emballage présentait des traces.",
      "Plat servi froid alors que la commande indiquait chaud.",
      "Les portions étaient bien plus petites que sur la photo.",
      "Allergène non déclaré présent dans le plat.",
      "Communication désagréable avec le vendeur.",
    ]),
    resolutionNotes: status === "resolved" ? "Avertissement envoyé au vendeur. Listing retiré." : undefined,
  });
}
reports.sort((a, b) => +new Date(b.date) - +new Date(a.date));

// ----------------- CITY STATS -----------------

const cityStats: CityStat[] = CITIES.map((c) => {
  const cityOrders = orders.filter((o) => o.city === c.name);
  return {
    city: c.name,
    lat: c.lat,
    lng: c.lng,
    orders: cityOrders.length,
    sellers: sellers.filter((s) => s.city === c.name).length,
    buyers: buyers.filter((b) => b.city === c.name).length,
    drivers: drivers.filter((d) => d.city === c.name).length,
    revenue: +cityOrders.reduce((s, o) => s + o.total, 0).toFixed(0),
  };
});

// ----------------- TIME SERIES -----------------

export const activityOverTime = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  const baseOrders = 18 + Math.round(Math.sin(i / 3) * 6) + between(0, 8);
  const baseUsers = 4 + Math.round(Math.cos(i / 4) * 2) + between(0, 4);
  const baseRevenue = baseOrders * betweenF(8.5, 14);
  const date = new Date(Date.UTC(2026, 4, 6) - day * 86400000);
  return {
    date: date.toISOString().slice(0, 10),
    label: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    orders: baseOrders,
    users: baseUsers,
    revenue: +baseRevenue.toFixed(0),
  };
});

export const categoryDistribution = [
  { name: "Fait Maison", value: sellers.filter((s) => s.category === "faitMaison").length, color: "var(--primary)" },
  { name: "Traiteur", value: sellers.filter((s) => s.category === "traiteur").length, color: "var(--secondary)" },
  { name: "Restaurant", value: sellers.filter((s) => s.category === "restaurant").length, color: "var(--info)" },
];

export const liveFeed = orders.slice(0, 25).map((o) => ({
  id: o.id,
  text: `${o.buyerName.split(" ")[0]} a commandé chez ${o.sellerName.split(" ")[0]}`,
  amount: o.total,
  city: o.city,
  date: o.date,
  category: o.category,
}));

// ----------------- COHORT / FUNNEL / HEATMAP -----------------

export const cohortMatrix = Array.from({ length: 8 }, (_, weekIdx) => {
  const weeks: (number | null)[] = [];
  for (let w = 0; w < 8; w++) {
    if (w < weekIdx) weeks.push(null);
    else {
      const decay = Math.max(20, 100 - (w - weekIdx) * (10 + between(0, 5)));
      weeks.push(decay);
    }
  }
  return {
    cohort: `S-${(8 - weekIdx).toString().padStart(2, "0")}`,
    size: between(80, 240),
    retention: weeks,
  };
});

export const funnelData = [
  { step: "Visite", value: 12480, color: "var(--info)" },
  { step: "Navigation", value: 9610, color: "var(--primary)" },
  { step: "Vue annonce", value: 6240, color: "var(--primary)" },
  { step: "Panier", value: 3120, color: "var(--secondary)" },
  { step: "Commande validée", value: 2180, color: "var(--success)" },
];

export const activityHeatmap = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => {
    let v = between(0, 5);
    if (hour >= 11 && hour <= 14) v += between(8, 18);
    if (hour >= 18 && hour <= 21) v += between(12, 24);
    if (day === 5 || day === 6) v = Math.round(v * 1.2);
    return { day, hour, value: v };
  }),
).flat();

export const notificationEngagement = [
  { type: "Nouvelle commande", openRate: 87 },
  { type: "Confirmation livraison", openRate: 78 },
  { type: "Promotion vendeur", openRate: 41 },
  { type: "Annonce expirée", openRate: 32 },
  { type: "Note demandée", openRate: 56 },
];

// ----------------- SUBSCRIPTIONS -----------------

export const subscriptionTiers = [
  { category: "Le Bon Fait Maison" as const, tier: "Standard", price: 4.99, count: 142, mrr: 708.58, conversion: 28, tenure: 4.2 },
  { category: "Le Bon Fait Maison" as const, tier: "Premium", price: 9.99, count: 64, mrr: 639.36, conversion: 18, tenure: 6.1 },
  { category: "L'Atelier Traiteur" as const, tier: "Standard", price: 9.99, count: 58, mrr: 579.42, conversion: 32, tenure: 5.4 },
  { category: "L'Atelier Traiteur" as const, tier: "Premium", price: 14.99, count: 22, mrr: 329.78, conversion: 22, tenure: 7.0 },
  { category: "Sauve Ton Panier" as const, tier: "Standard", price: 4.99, count: 86, mrr: 429.14, conversion: 36, tenure: 3.8 },
  { category: "Sauve Ton Panier" as const, tier: "Premium", price: 9.99, count: 31, mrr: 309.69, conversion: 19, tenure: 5.2 },
];

export const subscriptionGrowth = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, 5 + i, 1).toLocaleDateString("fr-FR", { month: "short" }),
  free: 320 + i * 28 + between(-10, 10),
  standard: 140 + i * 18 + between(-5, 8),
  premium: 60 + i * 10 + between(-3, 6),
}));

// ----------------- REVENUE -----------------

export const revenueOverTime = Array.from({ length: 30 }, (_, i) => {
  const day = 29 - i;
  const date = new Date(Date.UTC(2026, 4, 6) - day * 86400000);
  const gmv = 1200 + Math.round(Math.sin(i / 5) * 200) + between(0, 400);
  const commission = +(gmv * 0.28).toFixed(0);
  const subscriptions = between(60, 140);
  return {
    date: date.toISOString().slice(0, 10),
    label: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    gmv,
    commission,
    subscriptions,
  };
});

export const revenueByCategory = Array.from({ length: 6 }, (_, i) => {
  const month = new Date(2025, 11 + i, 1);
  return {
    month: month.toLocaleDateString("fr-FR", { month: "short" }),
    "Fait Maison": between(2200, 4400),
    "Atelier Traiteur": between(1800, 3600),
    "Sauve Ton Panier": between(2800, 5200),
  };
});

export const recentTransactions = orders.slice(0, 30).map((o, i) => ({
  id: `tx_${(i + 1).toString().padStart(5, "0")}`,
  date: o.date,
  type: i % 7 === 0 ? "Abonnement" : i % 11 === 0 ? "Boost" : "Commission",
  seller: o.sellerName,
  amount: i % 7 === 0 ? 9.99 : i % 11 === 0 ? 4.99 : +(o.total * 0.28).toFixed(2),
}));

// ----------------- TOP CITIES -----------------

export const topCities = [...cityStats].sort((a, b) => b.orders - a.orders).slice(0, 10);

export { users, sellers, listings, orders, reports, cityStats };
