import { useMutation } from '@tanstack/react-query';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { UpdateLocationRequest } from 'utils/types';

export const useLocationUpdate = (locationId: number | string) =>
  useMutation({
    mutationKey: ['outage-locations', 'edit', locationId],
    mutationFn: (updatedLocation: UpdateLocationRequest) =>
      apiClient
        .put(API_ENDPOINTS.locations.edit(locationId.toString()), updatedLocation)
        .then((res) => res.data),
  });
