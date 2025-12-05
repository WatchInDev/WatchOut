import dayjs from 'dayjs';
import { reverseGeocode } from 'features/map/reverseGeocode';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Coordinates, CreateEventRequest } from 'utils/types';
import { useCreateEvent } from './useEventCreate';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useUserLocation } from 'features/map/useLocation';

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

export const useEventCreateForm = (location: Coordinates, onSuccess: () => void) => {
  const eventBottomSheetRef = useRef<BottomSheetModal>(null);

  const [selectedEventType, setSelectedEventType] = useState<SelectedEventType>(null);
  const [eventTypeModalVisible, setEventTypeModalVisible] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<string>('Ładowanie lokalizacji...');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    eventTypeId: null,
    images: [],
  });

  useEffect(() => {
    reverseGeocode(location)
      .then((address) => setGeocodedAddress(address))
      .catch(() => setGeocodedAddress('Nieznana lokalizacja'));
  }, [location]);

  const createEventMutation = useCreateEvent();

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSetSelectedEventType = useCallback((eventType: SelectedEventType) => {
    setSelectedEventType(eventType);
    setFormData((prev) => ({ ...prev, eventTypeId: eventType?.id || null }));
  }, []);

  const validateForm = useCallback(() => {
    const { name, description, eventTypeId } = formData;
    return name && description && eventTypeId !== null;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({ name: '', description: '', eventTypeId: null, images: [] });
  }, []);

  const userLocation = useUserLocation();

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      Alert.alert('Błąd', 'Wszystkie pola muszą być wypełnione.');
      return;
    }

    if (!userLocation.location) {
      Alert.alert('Błąd', 'Aby móc utworzyć zdarzenie, upewnij się, że usługi lokalizacyjne są włączone.');
      return;
    }

    const dateInOneHour = dayjs().add(3, 'hours');

    const requestData: CreateEventRequest = {
      name: formData.name,
      description: formData.description,
      latitude: location.latitude,
      longitude: location.longitude,
      userLatitude: userLocation?.location.latitude,
      userLongitude: userLocation?.location.longitude,
      endDate: dateInOneHour.toISOString(),
      images: formData.images.map((image) => image.base64),
      eventTypeId: formData.eventTypeId!,
    };

    createEventMutation.mutate(requestData, {
      onSuccess: () => {
        Alert.alert('Sukces!', 'Nowe zdarzenie zostało zgłoszone.');
        resetForm();
        onSuccess();
      },
      onError: (error) => {
        Alert.alert('Błąd', `Nie udało się zgłosić zdarzenia. Spróbuj ponownie. ${error.message}`);
      },
    });
  }, [validateForm, formData, location, createEventMutation, resetForm, onSuccess, userLocation.location]);

  return {
    formData,
    eventBottomSheetRef,
    selectedEventType,
    eventTypeModalVisible,
    geocodedAddress,
    isLoading: createEventMutation.isPending,
    updateField,
    handleSetSelectedEventType,
    setEventTypeModalVisible,
    handleSubmit,
  };
};
