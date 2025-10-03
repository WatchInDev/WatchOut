import React, { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { ScrollView, StyleSheet, Alert, View, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { TextInput, Button } from 'react-native-paper';
import { Text } from 'components/Base/Text';
import { useCreateEvent } from 'hooks/events.hooks';
import { Coordinates, CreateEventRequest } from 'utils/types';
import { reverseGeocode } from 'utils/reverseGeocode';

type CreateEventProps = {
  location: Coordinates;
  onSuccess: () => void;
}

type FormData = {
  name: string;
  description: string;
}

export const CreateEvent = ({ location, onSuccess }: CreateEventProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });
  const [eventTypeModalVisible, setEventTypeModalVisible] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<{ id: number; name: string } | null>(null);
  const eventTypes = [
    { id: 1, name: 'Wypadek' },
    { id: 2, name: 'Awaria' },
    { id: 3, name: 'Zdarzenie drogowe' },
    { id: 4, name: 'Inne' },
  ];

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
    setFormData({ name: '', description: '' });
  }, []);

  const validateForm = useCallback(() => {
    const { name, description } = formData;
    return name && description;
  }, [formData]);

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Błąd', 'Wszystkie pola muszą być wypełnione.');
      return;
    }

    const dateInOneHour = dayjs().add(1, 'hours');

    const requestData: CreateEventRequest = {
      name: formData.name,
      description: formData.description,
      latitude: location.latitude,
      longitude: location.longitude,
      endDate: dateInOneHour.toISOString(),
      image: null,
      eventTypeId: 1 // Placeholder, should be dynamic
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
          editable={false}
        />
      </TouchableOpacity>

      <Modal
        isVisible={eventTypeModalVisible}
        style={{ margin: 30, backgroundColor: 'white', borderRadius: 8, padding: 16 }}
        onDismiss={() => setEventTypeModalVisible(false)}
      >
        <Text className='text-xl font-semibold mb-4'>Wybierz rodzaj zdarzenia</Text>
        <ScrollView>
          {eventTypes.map((eventType) => (
            <Button
              key={eventType.id}
              mode={selectedEventType?.id === eventType.id ? "contained" : "outlined"}
              onPress={() => {
                setSelectedEventType(eventType);
                setEventTypeModalVisible(false);
              }}
            >
              {eventType.name}
            </Button>
          ))}
        </ScrollView>
        <Button
          mode="outlined"
          onPress={() => setEventTypeModalVisible(false)}
          style={{ marginTop: 16 }}
        >
          Anuluj
        </Button>
      </Modal>
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