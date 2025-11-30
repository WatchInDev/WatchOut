import { useState, useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'components/Base/Text';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { useCreateEvent } from 'features/events/create/useEventCreate';
import { Coordinates, CreateEventRequest } from 'utils/types';
import { reverseGeocode } from 'features/map/reverseGeocode';
import { EventTypeSelectionModal } from './EventTypeSelectionModal';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Button, Icon } from 'react-native-paper';
import { PageWrapper } from 'components/Common/PageWrapper';
import { ImageUploader } from './ImageUploader';
import { useActionAvailability } from './useActionAvailability';

type CreateEventProps = {
  location: Coordinates;
  onSuccess: () => void;
  onClose: () => void;
};

type FormData = {
  name: string;
  description: string;
  eventTypeId: number | null;
  images: { uri: string; base64: string }[];
};

export const CreateEventBottomSheet = ({ location, onSuccess, onClose }: CreateEventProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    bottomSheetRef.current?.present();
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        bottomSheetRef.current?.close();
      };
    }, [])
  );

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    eventTypeId: null,
    images: [],
  });
  const { data: actionAvailability, isLoading: isActionAvailabilityLoading } =
    useActionAvailability();

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
    setFormData({ name: '', description: '', eventTypeId: null, images: [] });
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
  };

  const isLoading = createEventMutation.isPending;

  return (
    <BottomSheetModal ref={bottomSheetRef} enablePanDownToClose onDismiss={onClose}>
      <BottomSheetView>
        <PageWrapper>
          {isActionAvailabilityLoading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : actionAvailability?.canPost ? (
          <View style={styles.container}>
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

            <ImageUploader
              images={formData.images}
              onImagesUpload={(images) => updateField('images', images)}
            />

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
          </View>
          ) : (
            <ActionNotAvailableMessage />
          )}
        </PageWrapper>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const ActionNotAvailableMessage = () => {
  return (
    <View style={{ gap: 8, padding: 16 }}>
      <Row style={{ justifyContent: 'center', marginVertical: 8 }}>
        <Icon source="block-helper" size={64} color={theme.palette.tertiary}/>
      </Row>
      <Text variant="h3" align="center">
        Akcja niedostępna
      </Text>
      <Text align="center">
        Nie możesz zgłosić nowego zdarzenia, ponieważ twoja reputacja jest zbyt niska. Spróbuj ponownie później.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    zIndex: 5,
    justifyContent: 'space-between',
    flexDirection: 'column',
    paddingHorizontal: 4,
    gap: 16,
  },
  title: {
    marginBottom: 4,
    textAlign: 'center',
  },
});
