import { useQuery } from '@tanstack/react-query';
import { useUserLocation } from 'components/location/UserLocationContext';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { ActionAvailabilityResponse, Coordinates } from 'utils/types';

export const useActionAvailability = ({ eventLat, eventLong }: { eventLat: number; eventLong: number }) => {
  const { location: userLocation, isLoading: isUserLocationLoading } = useUserLocation();

  const { data: availability, isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ['actionAvailability', { eventLat, eventLong }, userLocation],
    queryFn: () => {
      if (userLocation == null) {
        throw new Error('User location is required to check action availability');
      }
      return apiClient
        .get<ActionAvailabilityResponse>(
          API_ENDPOINTS.events.availability({
            eventLat: eventLat,
            eventLong: eventLong,
            lat: userLocation.latitude,
            long: userLocation.longitude,
          })
        )
        .then((res) => res.data);
    },
    enabled: !isUserLocationLoading && userLocation != null,
  });

  return { availability, isLoading: isAvailabilityLoading || isUserLocationLoading };
};
