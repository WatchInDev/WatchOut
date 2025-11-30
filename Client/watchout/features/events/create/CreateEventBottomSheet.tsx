import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'components/Base/Text';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { Coordinates } from 'utils/types';
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

type CreateEventProps = {
  location: Coordinates;
  onSuccess: () => void;
  onClose: () => void;
};

export const CreateEventBottomSheet = ({ location, onSuccess, onClose }: CreateEventProps) => {
  const {
    formData,
    handleSubmit,
    handleSetSelectedEventType,
    eventTypeModalVisible,
    setEventTypeModalVisible,
    selectedEventType,
    updateField,
    geocodedAddress,
    eventBottomSheetRef,
    isLoading,
  } = useEventCreateForm(location, onSuccess);

  const { data: actionAvailability, isLoading: isActionAvailabilityLoading } =
    useActionAvailability();

  useEffect(() => {
    eventBottomSheetRef.current?.present();
  }, [eventBottomSheetRef]);

  return (
    <BottomSheetModal ref={eventBottomSheetRef} enablePanDownToClose onDismiss={onClose}>
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
