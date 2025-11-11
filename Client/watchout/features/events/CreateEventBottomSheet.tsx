import { useState, useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { Text } from 'components/Base/Text';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { useCreateEvent } from 'features/events/events.hooks';
import { Coordinates, CreateEventRequest } from 'utils/types';
import { reverseGeocode } from 'features/map/reverseGeocode';
import { EventTypeSelectionModal } from './EventTypeSelectionModal';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

type CreateEventProps = {
  location: Coordinates;
  onSuccess: () => void;
};

type FormData = {
  name: string;
  description: string;
  eventTypeId: number | null;
};

export const CreateEventBottomSheet = ({ location, onSuccess }: CreateEventProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    bottomSheetRef.current?.present();
  }, []);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    eventTypeId: null,
  });

  const [selectedEventType, setSelectedEventType] = useState<{
    id: number;
    name: string;
    icon: string;
  } | null>(null);
  
  const handleSetSelectedEventType = (
    eventType: { id: number; name: string; icon: string } | null
  ) => {
    setSelectedEventType(eventType);
    setFormData((prev) => ({ ...prev, eventTypeId: eventType?.id || null }));
  };
  const [eventTypeModalVisible, setEventTypeModalVisible] = useState(false);

  const [geocodedAddress, setGeocodedAddress] = useState<string>('Ładowanie lokalizacji...');
  useEffect(() => {
    reverseGeocode(location)
      .then((address) => setGeocodedAddress(address))
      .catch(() => setGeocodedAddress('Nieznana lokalizacja'));
  }, [location]);

  const createEventMutation = useCreateEvent();

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

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
  console.log('Event type: ', selectedEventType?.name);
  

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BottomSheetModal ref={bottomSheetRef} enableDynamicSizing enablePanDownToClose>
        <BottomSheetView style={styles.container}>
          <Text variant="h3" style={styles.title}>
            Zgłoś nowe zdarzenie!
          </Text>

          <View style={{ gap: 20 }}>
            <CustomTextInput
              placeholder="Nadaj tytuł zdarzeniu"
              label="Tytuł zdarzenia"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
            />
            <CustomTextInput
              placeholder="Opisz krótko zdarzenie, podaj najważniejsze informacje"
              label="Opis zdarzenia"
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity onPress={() => setEventTypeModalVisible(true)}>
              <CustomTextInput
                value={selectedEventType?.name || 'Wybierz rodzaj zdarzenia'}
                label="Rodzaj zdarzenia"
                startIcon={selectedEventType?.icon}
                endIcon="menu-down"
                editable={false}
              />
            </TouchableOpacity>
          </View>

          <EventTypeSelectionModal
            isVisible={eventTypeModalVisible}
            setIsVisible={setEventTypeModalVisible}
            eventType={selectedEventType}
            setEventType={handleSetSelectedEventType}
          />

          <Text style={{ fontSize: 16 }}>{`Lokalizacja: ${geocodedAddress}`}</Text>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginTop: 16 }}>
            {isLoading ? 'Zgłaszanie...' : 'Zgłoś zdarzenie'}
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 16,
  },
  title: {
    marginBottom: 4,
    textAlign: 'center',
  },
});
