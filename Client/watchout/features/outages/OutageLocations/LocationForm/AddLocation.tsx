import { AddLocationRequest } from 'utils/types';
import { LocationForm } from './LocationForm';
import { useLocationCreate } from './useLocationCreate';
import { useRoute } from '@react-navigation/native';
import { useSnackbar } from 'utils/useSnackbar';
import { useQueryClient } from '@tanstack/react-query';

export const AddLocation = () => {
  const { mutateAsync: createLocationAsync, isPending } = useLocationCreate();

  const route = useRoute();
  const { location } =
    (route.params as {
      location: AddLocationRequest;
      onSubmit: (location: AddLocationRequest) => void;
    }) || {};

  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const handleSubmit = async (location: AddLocationRequest) => {
    try {
      await createLocationAsync(location);
      showSnackbar({ message: 'Lokalizacja została dodana pomyślnie', type: 'success' });
    } catch {
      showSnackbar({ message: 'Wystąpił błąd podczas dodawania lokalizacji', type: 'error' });
    }
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['pinnedLocations'] });
  };

  return <LocationForm submit={handleSubmit} initialLocation={location} isPending={isPending} />;
};
