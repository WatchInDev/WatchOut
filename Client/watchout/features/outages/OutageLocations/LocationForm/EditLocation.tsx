import { AddLocationRequest, PinnedLocation } from 'utils/types';
import { useLocationUpdate } from './useLocationUpdate';
import { LocationForm } from './LocationForm';
import { useRoute } from '@react-navigation/native';
import { useSnackbar } from 'utils/useSnackbar';
import { useQueryClient } from '@tanstack/react-query';

export const EditLocation = () => {
  const route = useRoute();

  const { location } =
    (route.params as {
      location: PinnedLocation;
    }) || {};

  const { mutateAsync: updateAsync, isPending } = useLocationUpdate(location.id);

  const locationRequest: AddLocationRequest = {
    ...location,
    settings: {
      radius: location.radius,
      services: {
        ...location.services,
      },
    },
  };

  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const handleSubmitAsync = async (updatedLocation: AddLocationRequest) => {
    try {
      await updateAsync(updatedLocation);
      showSnackbar({ message: 'Lokalizacja została edytowana pomyślnie', type: 'success' });
    } catch {
      showSnackbar({ message: 'Wystąpił błąd podczas edytowania lokalizacji', type: 'error' });
    }
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['pinnedLocations'] });
  };

  return (
    <LocationForm submit={handleSubmitAsync} initialLocation={locationRequest} isPending={isPending} />
  );
};
