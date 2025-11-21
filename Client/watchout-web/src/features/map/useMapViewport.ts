import type { Coordinates, CoordinatesRect } from "@/types";
import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

export const useMapViewport = ({ padding = 0 }: { padding?: number } = {}) => {
  const map = useMap();
  const [coordinatesRect, setCoordinatesRect] = useState<CoordinatesRect>({
    neLat: 0,
    neLng: 0,
    swLat: 0,
    swLng: 0,
  });
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    if (!map) return;

    const listener = map.addListener("idle", () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const projection = map.getProjection();

      if (!bounds || !zoom || !projection) return;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const paddingDegrees = degreesPerPixel(zoom) * padding;

      const n = Math.min(90, ne.lat() + paddingDegrees);
      const s = Math.max(-90, sw.lat() - paddingDegrees);

      const w = sw.lng() - paddingDegrees;
      const e = ne.lng() + paddingDegrees;

      setCoordinatesRect({ neLat: n, neLng: e, swLat: s, swLng: w });
      setZoom(zoom);
    });

    return () => listener.remove();
  }, [map, padding]);

  return { coordinatesRect, zoom };
}

function degreesPerPixel(zoomLevel: number) {
  return 360 / (Math.pow(2, zoomLevel) * 256);
}