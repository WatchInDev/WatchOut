import Modal from 'react-native-modal';
import { Text } from 'components/Base/Text';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Button, Card, Icon } from 'react-native-paper';
import { useGetEventTypes } from 'features/events/event-types.hooks';

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
    <Modal isVisible={isVisible} onDismiss={() => setIsVisible(false)}>
      <View style={styles.modal}>
        <Text style={styles.title}>Wybierz rodzaj zdarzenia</Text>
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
                <Icon source={type.icon} size={48} />
                <Text style={eventType?.id === type.id ? styles.selectedText : undefined}>
                  {type.name}
                </Text>
              </View>
            </Card>
          ))}
        </ScrollView>
        <Button mode="outlined" onPress={() => setIsVisible(false)} style={styles.cancelButton}>
          Anuluj
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 16,
    margin: 12,
    borderRadius: 8,
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
    outlineColor: '#6200ee',
    outlineWidth: 2,
    backgroundColor: '#e3d7ff',
  },
  selectedText: {
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 16,
  },
});
