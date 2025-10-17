import { useState } from 'react';
import { useGetEvents, useGetEventsClustered } from 'features/events/events.hooks';
import MapView, { Region } from 'react-native-maps';
import { MAP_CLUSTERING_ZOOM_THRESHOLD } from 'utils/constants';

export const useMapLogic = (mapRef: React.RefObject<MapView>) => {
  const [mapBounds, setMapBounds] = useState({
    neLat: 0,
    neLng: 0,
    swLat: 0,
    swLng: 0,
  });
  const [isZoomedEnough, setIsZoomedEnough] = useState(false);

  const { data: events, refetch } = useGetEvents(mapBounds, isZoomedEnough);
  const zoomLevel = Math.log2(360 * (1 / (mapBounds.neLng - mapBounds.swLng)));
  
  const eps = Math.max(0.01, 0.1 / Math.pow(2, zoomLevel - 8));
  
  const { data: clusters } = useGetEventsClustered({
    coordinates: mapBounds, minPoints: 1, eps
  }, !isZoomedEnough);

  const onRegionChangeComplete = async (updateMapBounds: Region) => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = updateMapBounds;
    setMapBounds({
      neLat: latitude + latitudeDelta / 2,
      neLng: longitude + longitudeDelta / 2,
      swLat: latitude - latitudeDelta / 2,
      swLng: longitude - longitudeDelta / 2,
    });

    const cameraZoom = await mapRef.current?.getCamera().then((camera) => camera?.zoom);
    setIsZoomedEnough((cameraZoom || 0) >= MAP_CLUSTERING_ZOOM_THRESHOLD);
  };

  return { events, clusters, isZoomedEnough, onRegionChangeComplete, refetch };
};
