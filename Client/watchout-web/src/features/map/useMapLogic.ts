import { useState } from "react";
import { useGetEvents, useGetEventsClustered } from "./../events/events.hooks";
import { MAP_CLUSTERING_ZOOM_THRESHOLD } from "../../utils/constants";
import type { CoordinatesRect } from "../../types";

export const useMapLogic = (mapRef: React.RefObject<google.maps.Map | null>) => {
  const [mapBounds, setMapBounds] = useState<CoordinatesRect>({
    neLat: 0,
    neLng: 0,
    swLat: 0,
    swLng: 0,
  });
  const [isZoomedEnough, setIsZoomedEnough] = useState(false);

  const lonSpan = mapBounds.neLng - mapBounds.swLng || 360;
  const zoomLevel = Math.log2(360 * (1 / lonSpan));
  const eps = Math.max(0.01, 0.1 / Math.pow(2, zoomLevel - 8));

  const { data: clusters } = useGetEventsClustered(
    { coordinates: mapBounds, minPoints: 1, eps: 0.1 },
    !isZoomedEnough
  );
  const { data: events, refetch } = useGetEvents(mapBounds, isZoomedEnough);

  const onRegionChangeComplete = async (updateMapBounds: CoordinatesRect) => {
    const { neLat, neLng, swLat, swLng } = updateMapBounds;
    setMapBounds({
      neLat,
      neLng,
      swLat,
      swLng,
    });

    const cameraZoom = mapRef.current?.getZoom();
    setIsZoomedEnough((cameraZoom || 0) >= MAP_CLUSTERING_ZOOM_THRESHOLD);
  };

  return { events, clusters, isZoomedEnough, onRegionChangeComplete, refetch };
};
