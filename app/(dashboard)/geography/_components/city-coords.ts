/**
 * Client-side city → { lat, lng } lookup.
 *
 * The backend `GET /v1/admin/dashboard/cities` endpoint returns per-city
 * aggregates (`{ city, orderCount, revenueCents }`) with NO coordinates — the
 * SQL groups orders by `Address.city` (a plain string) and the schema has no
 * lat/lng to expose. Rather than invent a backend dependency, we resolve the
 * handful of French cities that actually appear against this local table.
 *
 * A city with no match here is dropped from the map (but still counted /
 * listed in the ranking, flagged "hors carte"). Extend the table as new
 * seeded cities show up.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** Fold a raw city string to a stable lookup key (lowercase, no accents). */
export function cityKey(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/^st[\s-]/, "saint-") // "St Etienne" → "saint-etienne"
    .replace(/[\s'’]+/g, "-") // spaces / apostrophes → hyphen
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .trim();
}

/** Coordinates keyed by `cityKey(name)`. */
const CITY_COORDS: Record<string, LatLng> = {
  paris: { lat: 48.8566, lng: 2.3522 },
  marseille: { lat: 43.2965, lng: 5.3698 },
  lyon: { lat: 45.764, lng: 4.8357 },
  toulouse: { lat: 43.6047, lng: 1.4442 },
  nice: { lat: 43.7102, lng: 7.262 },
  nantes: { lat: 47.2184, lng: -1.5536 },
  montpellier: { lat: 43.6109, lng: 3.8772 },
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  bordeaux: { lat: 44.8378, lng: -0.5792 },
  lille: { lat: 50.6292, lng: 3.0573 },
  rennes: { lat: 48.1173, lng: -1.6778 },
  reims: { lat: 49.2583, lng: 4.0317 },
  "saint-etienne": { lat: 45.4397, lng: 4.3872 },
  toulon: { lat: 43.1242, lng: 5.928 },
  "le-havre": { lat: 49.4944, lng: 0.1079 },
  grenoble: { lat: 45.1885, lng: 5.7245 },
  dijon: { lat: 47.322, lng: 5.0415 },
  angers: { lat: 47.4784, lng: -0.5632 },
  nimes: { lat: 43.8367, lng: 4.3601 },
  "aix-en-provence": { lat: 43.5297, lng: 5.4474 },
  "clermont-ferrand": { lat: 45.7772, lng: 3.087 },
  "le-mans": { lat: 48.0061, lng: 0.1996 },
  brest: { lat: 48.3904, lng: -4.4861 },
  tours: { lat: 47.3941, lng: 0.6848 },
  amiens: { lat: 49.8941, lng: 2.2957 },
  limoges: { lat: 45.8336, lng: 1.2611 },
  annecy: { lat: 45.8992, lng: 6.1294 },
  perpignan: { lat: 42.6887, lng: 2.8948 },
  besancon: { lat: 47.238, lng: 6.0243 },
  metz: { lat: 49.1193, lng: 6.1757 },
  orleans: { lat: 47.9029, lng: 1.9093 },
  rouen: { lat: 49.4432, lng: 1.0993 },
  mulhouse: { lat: 47.7508, lng: 7.3359 },
  caen: { lat: 49.1829, lng: -0.3707 },
  nancy: { lat: 48.6921, lng: 6.1844 },
  avignon: { lat: 43.9493, lng: 4.8055 },
  cannes: { lat: 43.5528, lng: 7.0174 },
  "boulogne-billancourt": { lat: 48.8352, lng: 2.2409 },
  nanterre: { lat: 48.8924, lng: 2.2069 },
  versailles: { lat: 48.8014, lng: 2.1301 },
  "saint-denis": { lat: 48.9362, lng: 2.3574 },
  argenteuil: { lat: 48.9472, lng: 2.2467 },
  montreuil: { lat: 48.8638, lng: 2.4485 },
  creteil: { lat: 48.7904, lng: 2.4556 },
  pau: { lat: 43.2951, lng: -0.3708 },
  bayonne: { lat: 43.4929, lng: -1.4748 },
  "la-rochelle": { lat: 46.1603, lng: -1.1511 },
  poitiers: { lat: 46.5802, lng: 0.3404 },
  troyes: { lat: 48.2973, lng: 4.0744 },
  lorient: { lat: 47.7477, lng: -3.3702 },
  valence: { lat: 44.9334, lng: 4.892 },
  chambery: { lat: 45.5646, lng: 5.9178 },
  colmar: { lat: 48.0794, lng: 7.3585 },
  quimper: { lat: 47.9963, lng: -4.0985 },
  vannes: { lat: 47.6582, lng: -2.7608 },
  "villeurbanne": { lat: 45.7719, lng: 4.8902 },
};

/** Resolve a raw city name to coordinates, or `null` when unknown. */
export function coordsFor(city: string): LatLng | null {
  return CITY_COORDS[cityKey(city)] ?? null;
}
