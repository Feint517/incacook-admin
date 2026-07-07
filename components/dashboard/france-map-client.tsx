"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { latLngBounds } from "leaflet";
import type { MapPoint } from "./france-map";
import { useTheme } from "next-themes";
import { useEffect, useMemo } from "react";

const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
const ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Metropolitan-France fallback view (used when there are no points). */
const FRANCE_CENTER: [number, number] = [46.6, 2.4];
const FRANCE_ZOOM = 5;

/**
 * Keeps the viewport framed on the current points. A single city zooms in on
 * it; multiple cities fit their bounds. With no points we fall back to the
 * whole-France view.
 */
function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView(FRANCE_CENTER, FRANCE_ZOOM);
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 9);
      return;
    }
    const bounds = latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 10 });
  }, [map, points]);
  return null;
}

export default function FranceMapClient({
  points,
  metric,
  height,
}: {
  points: MapPoint[];
  metric: string;
  height: number;
}) {
  const { theme } = useTheme();
  // Normalise weights so a single very large value (e.g. revenue in euros)
  // scales markers sensibly instead of blowing out the radius.
  const max = useMemo(
    () => Math.max(...points.map((p) => p.weight), 1),
    [points],
  );

  return (
    <div
      className="overflow-hidden rounded-md border border-outline-variant"
      style={{ height }}
    >
      <MapContainer
        center={FRANCE_CENTER}
        zoom={FRANCE_ZOOM}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer attribution={ATTR} url={theme === "dark" ? TILE_DARK : TILE_LIGHT} />
        <FitBounds points={points} />
        {points.map((p) => {
          const t = p.weight / max;
          const radius = 8 + t * 26;
          return (
            <CircleMarker
              key={p.city}
              center={[p.lat, p.lng]}
              radius={radius}
              pathOptions={{
                color: "#00C263",
                weight: 1.5,
                fillColor: "#00C263",
                fillOpacity: 0.18 + t * 0.45,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <div className="text-xs">
                  <div className="font-semibold">{p.city}</div>
                  {p.details ? (
                    Object.entries(p.details).map(([k, v]) => (
                      <div key={k} className="text-on-surface-variant">
                        {k}: {v}
                      </div>
                    ))
                  ) : (
                    <div className="text-on-surface-variant">
                      {metric}: {p.weight.toLocaleString("fr-FR")}
                    </div>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
