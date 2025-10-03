import React, { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { ScrollView, StyleSheet, Alert, View, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Text } from 'components/Base/Text';
import { useCreateEvent } from 'features/events/events.hooks';
import { Coordinates, CreateEventRequest } from 'utils/types';
import { reverseGeocode } from '../map/reverseGeocode';
import { EventSelectionModal } from './EventSelectionModal';

type CreateEventProps = {
  location: Coordinates;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  description: string;
  eventTypeId: number | null;
}

export const CreateEvent = ({ location, onSuccess }: CreateEventProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    eventTypeId: null,
  });

  const [selectedEventType, setSelectedEventType] = useState<{ id: number; name: string; icon: string } | null>(null);
  const handleSetSelectedEventType = (eventType: { id: number; name: string; icon: string } | null) => {
    setSelectedEventType(eventType);
    setFormData(prev => ({ ...prev, eventTypeId: eventType?.id || null }));
  };
  const [eventTypeModalVisible, setEventTypeModalVisible] = useState(false);

  const [geocodedAddress, setGeocodedAddress] = useState<string>("Ładowanie lokalizacji...");
  useEffect(() => {
    reverseGeocode(location)
      .then(address => setGeocodedAddress(address))
      .catch(() => setGeocodedAddress("Nieznana lokalizacja"));
  }, [location]);

  const createEventMutation = useCreateEvent();

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = useCallback(() => {
    setFormData({ name: '', description: '', eventTypeId: null });
  }, []);

  const validateForm = useCallback(() => {
    const { name, description, eventTypeId } = formData;
    return name && description && eventTypeId !== null;
  }, [formData]);

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Błąd', 'Wszystkie pola muszą być wypełnione.');
      return;
    }

    const dateInOneHour = dayjs().add(3, 'hours');

    const requestData: CreateEventRequest = {
      name: formData.name,
      description: formData.description,
      latitude: location.latitude,
      longitude: location.longitude,
      endDate: dateInOneHour.toISOString(),
      image: null,
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
  };

  const isLoading = createEventMutation.isPending;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, justifyContent: 'center', gap: 8 }}
    >
      <Text className='text-3xl text-center font-semibold mb-4'>Zgłoś nowe zdarzenie!</Text>
      <TextInput
        label="Tytuł zdarzenia"
        mode="outlined"
        value={formData.name}
        onChangeText={(value) => updateField('name', value)}
      />
      <TextInput
        label="Opis zdarzenia"
        mode="outlined"
        value={formData.description}
        onChangeText={(value) => updateField('description', value)}
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity onPress={() => setEventTypeModalVisible(true)}>
        <TextInput
          label="Rodzaj zdarzenia"
          mode="outlined"
          value={selectedEventType?.name || "Wybierz rodzaj zdarzenia"}
          right={<TextInput.Icon icon="menu-down" />}
          left={selectedEventType ? <TextInput.Icon icon={selectedEventType.icon} /> : undefined}
          editable={false}
        />
      </TouchableOpacity>

      <EventSelectionModal
        isVisible={eventTypeModalVisible}
        setIsVisible={setEventTypeModalVisible}
        selectedEventType={selectedEventType}
        setSelectedEventType={handleSetSelectedEventType}
      />

      <Text className='text-lg'>{`Lokalizacja: ${geocodedAddress}`}</Text>
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={{ marginTop: 16 }}
      >
        {isLoading ? 'Zgłaszanie...' : 'Zgłoś zdarzenie'}
      </Button>
    </ScrollView>
  );
};