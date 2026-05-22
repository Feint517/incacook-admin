"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const FranceMap = dynamic(() => import("./france-map-client"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-md bg-surface-container-low text-xs text-on-surface-variant">
      Chargement de la carte…
    </div>
  ),
});

export interface MapPoint {
  city: string;
  lat: number;
  lng: number;
  weight: number;
  details?: Record<string, number | string>;
}

export function FranceHeatmap({
  points,
  metric,
  height = 420,
}: {
  points: MapPoint[];
  metric: string;
  height?: number;
}) {
  const memoPoints = useMemo(() => points, [points]);
  return <FranceMap points={memoPoints} metric={metric} height={height} />;
}
