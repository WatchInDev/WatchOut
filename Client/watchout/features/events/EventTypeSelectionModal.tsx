import Modal from 'react-native-modal';
import { Text } from 'components/Base/Text';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Button, Card, Icon } from 'react-native-paper';
import { useGetEventTypes } from 'features/events/event-types.hooks';
import { theme } from 'utils/theme';
import { CustomModal } from 'components/Base/CustomModal';

type EventSelectionModalProps = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  eventType: { id: number; name: string; icon: string } | null;
  setEventType: (eventType: { id: number; name: string; icon: string } | null) => void;
};

export const EventTypeSelectionModal = ({
  isVisible,
  setIsVisible,
  eventType,
  setEventType,
}: EventSelectionModalProps) => {
  const { data: eventTypes } = useGetEventTypes();

  return (
    <CustomModal isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
      <Text variant="h5" style={{ textAlign: 'center' }}>
        Wybierz rodzaj zdarzenia
      </Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {eventTypes?.map((type) => (
          <Card
            key={type.id}
            mode="contained"
            style={
              eventType?.id === type.id
                ? styles.selectedCard
                : eventType
                  ? { opacity: 0.7 }
                  : undefined
            }
            onPress={() => {
              setEventType(type);
              setIsVisible(false);
            }}>
            <View style={styles.cardContent}>
              <Icon source={type.icon} size={48} color={eventType?.id === type.id ? theme.palette.background.default : undefined} />
              <Text
                color={eventType?.id === type.id ? 'primaryInverse' : undefined}
                style={eventType?.id === type.id ? styles.selectedText : undefined}>
                {type.name}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
      <Button mode="outlined" onPress={() => setIsVisible(false)} style={styles.cancelButton}>
        Anuluj
      </Button>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  scrollContainer: {
    flexDirection: 'column',
    gap: 8,
    padding: 2,
  },
  cardContent: {
    flexDirection: 'row',
    margin: 8,
    gap: 16,
    alignItems: 'center',
  },
  selectedCard: {
    outlineColor: theme.palette.primary,
    outlineWidth: 2,
    backgroundColor: theme.palette.primary,
  },
  selectedText: {
    fontWeight: 'bold',
    color: theme.palette.background.default,
  },
  cancelButton: {
    marginTop: 16,
  },
});
