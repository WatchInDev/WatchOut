import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'components/Base/Text';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { Coordinates, PostUnabilityReason } from 'utils/types';
import { EventTypeSelectionModal } from './EventTypeSelectionModal';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { ActivityIndicator, Button, Icon } from 'react-native-paper';
import { PageWrapper } from 'components/Common/PageWrapper';
import { ImageUploader } from './ImageUploader';
import { useEventCreateForm } from './useEventCreateForm';
import { useEffect } from 'react';
import { useActionAvailability } from './useActionAvailability';
import { Row } from 'components/Base/Row';
import { theme } from 'utils/theme';
import { Controller } from 'react-hook-form';
import { useUserLocation } from 'features/map/useLocation';
import { unavailabilityDictionary } from 'utils/dictionaries';

type CreateEventProps = {
  location: Coordinates;
  onSuccess: () => void;
  onClose: () => void;
};

export const CreateEventBottomSheet = ({ location, onSuccess, onClose }: CreateEventProps) => {
  const { location: userLocation, loading: isUserLocationLoading } = useUserLocation();
  const isUserLocationFetched = !isUserLocationLoading && userLocation != null;

  const {
    control,
    handleSubmit,
    handleSetSelectedEventType,
    eventTypeModalVisible,
    setEventTypeModalVisible,
    selectedEventType,
    geocodedAddress,
    eventBottomSheetRef,
    isLoading,
  } = useEventCreateForm(location, userLocation, onSuccess);


  const { data: actionAvailability, isLoading: isActionAvailabilityLoading } =
    useActionAvailability(
      {
        lat: userLocation?.latitude ?? 0,
        long: userLocation?.longitude ?? 0,
        eventLat: location.latitude,
        eventLong: location.longitude,
      },
      { isEnabled: isUserLocationFetched }
    );

  useEffect(() => {
    eventBottomSheetRef.current?.present();
  }, [eventBottomSheetRef]);

  return (
    <BottomSheetModal ref={eventBottomSheetRef} enablePanDownToClose onDismiss={onClose}>
      <BottomSheetView>
        <PageWrapper>
          {!isUserLocationFetched ? (
            <View style={{ padding: 16, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <View>
                <Icon source="map-marker-off" size={64} color={theme.palette.text.secondary} />
              </View>
              <Text variant="h3" align="center">
                Lokalizacja niedostępna
              </Text>
              <Text color="secondary" align="center">
                Aby móc zgłosić nowe zdarzenie, potrzebujemy wiedzieć, że znajdujesz się w pobliżu
                miejsca zdarzenia. Upewnij się, że usługi lokalizacyjne są włączone i spróbuj
                ponownie.
              </Text>
            </View>
          ) : isActionAvailabilityLoading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : actionAvailability?.canPost ? (
            <View style={styles.container}>
              <Text variant="h3" style={styles.title}>
                Zgłoś nowe zdarzenie!
              </Text>

              <View style={{ gap: 20 }}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { value, onChange } }) => (
                    <CustomTextInput
                      placeholder="Nadaj tytuł zdarzeniu"
                      label="Tytuł zdarzenia"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="description"
                  render={({ field: { value, onChange } }) => (
                    <CustomTextInput
                      placeholder="Opisz krótko zdarzenie, podaj najważniejsze informacje"
                      label="Opis zdarzenia"
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={3}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="eventTypeId"
                  render={({ field: { value } }) => (
                    <TouchableOpacity onPress={() => setEventTypeModalVisible(true)}>
                      <CustomTextInput
                        value={selectedEventType?.name || 'Wybierz rodzaj zdarzenia'}
                        label="Rodzaj zdarzenia"
                        startIcon={selectedEventType?.icon}
                        endIcon="menu-down"
                        editable={false}
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>

              <Controller
                control={control}
                name="images"
                render={({ field: { value, onChange } }) => (
                  <ImageUploader images={value} onImagesUpload={onChange} />
                )}
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
            <ActionNotAvailableMessage reason={actionAvailability?.reason} />
          )}
        </PageWrapper>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const ActionNotAvailableMessage = ({ reason }: { reason?: PostUnabilityReason }) => {
  const errorDescription = reason
    ? unavailabilityDictionary[reason]
    : 'Chwilowo nie jest możliwe zgłoszenie zdarzenia. Spróbuj ponownie później.';

  return (
    <View style={{ gap: 8, padding: 16 }}>
      <Row style={{ justifyContent: 'center', marginVertical: 8 }}>
        <Icon source="block-helper" size={64} color={theme.palette.tertiary} />
      </Row>
      <Text variant="h3" align="center">
        Akcja niedostępna
      </Text>
      <Text align="center">{errorDescription}</Text>
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
