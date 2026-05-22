"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "./france-map";
import { useTheme } from "next-themes";
import { useMemo } from "react";

const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
const ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
  const max = useMemo(() => Math.max(...points.map((p) => p.weight), 1), [points]);

  return (
    <div className="overflow-hidden rounded-md border border-outline-variant" style={{ height }}>
      <MapContainer
        center={[46.6, 2.4]}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer attribution={ATTR} url={theme === "dark" ? TILE_DARK : TILE_LIGHT} />
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
                  <div className="text-on-surface-variant">
                    {metric}: {p.weight.toLocaleString("fr-FR")}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
