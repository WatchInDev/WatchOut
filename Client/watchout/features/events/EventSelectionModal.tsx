import Modal from "react-native-modal";
import { Text } from "components/Base/Text";
import { ScrollView, View, StyleSheet } from "react-native";
import { Button, Card, Icon } from "react-native-paper";
import { useGetEventTypes } from "features/events/event-types.hooks";

type EventSelectionModalProps = {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  selectedEventType: { id: number; name: string; icon: string } | null;
  setSelectedEventType: (eventType: { id: number; name: string; icon: string } | null) => void;
}

export const EventSelectionModal = ({
  isVisible,
  setIsVisible,
  selectedEventType,
  setSelectedEventType
}: EventSelectionModalProps) => {
  const { data: eventTypes } = useGetEventTypes();

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      onDismiss={() => setIsVisible(false)}
    >
      <Text style={styles.title}>Wybierz rodzaj zdarzenia</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {eventTypes?.map((eventType) => (
          <Card
            key={eventType.id}
            mode='contained'
            style={selectedEventType?.id === eventType.id ? styles.selectedCard : (selectedEventType ? { opacity: 0.7 } : undefined)}
            onPress={() => {
              setSelectedEventType(eventType);
              setIsVisible(false);
            }}
          >
            <View style={styles.cardContent}>
              <Icon source={eventType.icon} size={48} />
              <Text style={selectedEventType?.id === eventType.id ? styles.selectedText : undefined}>
                {eventType.name}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
      <Button
        mode="outlined"
        onPress={() => setIsVisible(false)}
        style={styles.cancelButton}
      >
        Anuluj
      </Button>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center'
  },
  scrollContainer: {
    flexDirection: 'column',
    gap: 8,
    padding: 2
  },
  cardContent: {
    flexDirection: 'row',
    margin: 8,
    gap: 16,
    alignItems: 'center'
  },
  selectedCard: {
    outlineColor: '#6200ee',
    outlineWidth: 2,
    backgroundColor: '#e3d7ff'
  },
  selectedText: {
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 16
  }
});