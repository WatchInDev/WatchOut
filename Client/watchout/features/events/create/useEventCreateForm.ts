import dayjs from 'dayjs';
import { reverseGeocode } from 'features/map/reverseGeocode';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Coordinates, CreateEventRequest } from 'utils/types';
import { useCreateEvent } from './useEventCreate';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useUserLocation } from 'features/map/useLocation';
import { useForm } from 'react-hook-form';

type FormData = {
  name: string;
  description: string;
  eventTypeId: number | null;
  images: { uri: string; base64: string }[];
};

type SelectedEventType = {
  id: number;
  name: string;
  icon: string;
} | null;

export const useEventCreateForm = (
  location: Coordinates,
  userLocation: Coordinates | null,
  onSuccess: () => void
) => {
  const eventBottomSheetRef = useRef<BottomSheetModal>(null);

  const [selectedEventType, setSelectedEventType] = useState<SelectedEventType>(null);
  const [eventTypeModalVisible, setEventTypeModalVisible] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<string>('Ładowanie lokalizacji...');
  const { control, handleSubmit, setValue, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      eventTypeId: null,
      images: [],
    },
  });

  useEffect(() => {
    reverseGeocode(location)
      .then((address) => setGeocodedAddress(address))
      .catch(() => setGeocodedAddress('Nieznana lokalizacja'));
  }, [location]);

  const createEventMutation = useCreateEvent();

  const handleSetSelectedEventType = useCallback(
    (eventType: SelectedEventType) => {
      setSelectedEventType(eventType);
      setValue('eventTypeId', eventType?.id || null);
    },
    [setValue]
  );

  const onSubmit = (values: FormData) => {
    const isValid = values.name && values.description && values.eventTypeId !== null;
    if (!isValid) {
      Alert.alert('Błąd', 'Wszystkie pola muszą być wypełnione.');
      return;
    }
    if (!userLocation) {
      Alert.alert('Błąd', 'Nie udało się pobrać Twojej lokalizacji. Spróbuj ponownie.');
      return;
    }

    const dateInOneHour = dayjs().add(3, 'hours');

    const requestData: CreateEventRequest = {
      name: values.name,
      description: values.description,
      latitude: location.latitude,
      longitude: location.longitude,
      userLatitude: userLocation.latitude,
      userLongitude: userLocation.longitude,
      endDate: dateInOneHour.toISOString(),
      images: values.images.map((image) => image.base64),
      eventTypeId: values.eventTypeId!,
    };

    createEventMutation.mutate(requestData, {
      onSuccess: () => {
        Alert.alert('Sukces!', 'Nowe zdarzenie zostało zgłoszone.');
        reset();
        onSuccess();
      },
      onError: (error) => {
        Alert.alert('Błąd', `Nie udało się zgłosić zdarzenia. Spróbuj ponownie. ${error.message}`);
      },
    });
  };

  return {
    control,
    eventBottomSheetRef,
    selectedEventType,
    eventTypeModalVisible,
    geocodedAddress,
    isLoading: createEventMutation.isPending,
    handleSetSelectedEventType,
    setEventTypeModalVisible,
    handleSubmit: handleSubmit(onSubmit),
  };
};
