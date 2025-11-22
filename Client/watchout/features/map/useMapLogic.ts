import { useEffect, useState } from 'react';
import { useGetEvents, useGetEventsClustered } from 'features/events/events.hooks';
import MapView, { Region } from 'react-native-maps';
import { MAP_CLUSTERING_ZOOM_THRESHOLD } from 'utils/constants';
import { EventFilters } from 'utils/types';
import { hoursToMilliseconds } from 'utils/helpers';

export const useMapLogic = (mapRef: React.RefObject<MapView>, eventFilter: EventFilters) => {
  const [mapBounds, setMapBounds] = useState({
    neLat: 0,
    neLng: 0,
    swLat: 0,
    swLng: 0,
  });
  const zoomLevel = Math.log2(360 * (1 / (mapBounds.neLng - mapBounds.swLng)));
  const [isZoomedEnough, setIsZoomedEnough] = useState(false);
  const [initializationDate, setInitializationDate] = useState<Date>(new Date());

  useEffect(() => {
    setInitializationDate(new Date());
  }, []);

  const filterPayload = {
    coordinates: mapBounds,
    eventTypeIds: eventFilter.eventTypesIds,
    reportedDateFrom: new Date(
      initializationDate.getTime() - hoursToMilliseconds(eventFilter.hoursSinceReport)
    ),
  };

  const { data: events, refetch } = useGetEvents(filterPayload, isZoomedEnough);

  const eps = Math.max(0.01, 0.1 / Math.pow(2, zoomLevel - 8));

  const { data: clusters } = useGetEventsClustered(
    {
      baseRequest: filterPayload,
      minPoints: 1,
      eps,
    },
    !isZoomedEnough
  );

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
