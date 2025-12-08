import { AddLocationRequest, PinnedLocation } from 'utils/types';
import { useLocationUpdate } from './useLocationUpdate';
import { LocationForm } from './LocationForm';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSnackbar } from 'utils/useSnackbar';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { METERS_IN_KM } from 'utils/constants';

export const EditLocation = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { location } =
    (route.params as {
      location: PinnedLocation;
    }) || {};

  const { mutateAsync: updateAsync, isPending } = useLocationUpdate(location.id);

  const locationRequest: AddLocationRequest = useMemo(() => ({
    placeName: location.placeName,
    latitude: location.latitude,
    longitude: location.longitude,
    settings: {
      radius: location.radius,
      services: {
        ...location.services,
      },
      notificationsEnable: location.notificationsEnable,
    },
  }), [location]);

  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const handleSubmitAsync = async (updatedLocation: AddLocationRequest) => {
    try {
      console.log({ updatedLocation })
      await updateAsync(updatedLocation);
      showSnackbar({ message: 'Lokalizacja została edytowana pomyślnie', type: 'success' });

      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['pinnedLocations'] });
      navigation.goBack();
    } catch {
      showSnackbar({ message: 'Wystąpił błąd podczas edytowania lokalizacji', type: 'error' });
    }
  };

  return (
    <LocationForm submit={handleSubmitAsync} initialLocation={locationRequest} isPending={isPending} />
  );
};
