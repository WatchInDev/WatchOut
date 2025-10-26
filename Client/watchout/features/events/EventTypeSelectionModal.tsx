import Modal from 'react-native-modal';
import { Text } from 'components/Base/Text';
import { ScrollView, View, StyleSheet, TouchableHighlight } from 'react-native';
import { Button, Card, Icon } from 'react-native-paper';
import { useGetEventTypes } from 'features/events/event-types.hooks';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { theme } from 'utils/theme';
import { icons } from 'components/Base/icons';

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
        <Text variant="h4">Wybierz rodzaj zdarzenia</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {eventTypes?.map((type) => (
            <TouchableHighlight
              key={type.id}
              style={{ borderRadius: 8 }}
              onPress={() => {
                setEventType(type);
                setIsVisible(false);
              }}>
              <CustomSurface
                key={type.id}
                style={[
                  eventType?.id === type.id
                    ? styles.selectedCard
                    : eventType
                      ? { opacity: 0.7 }
                      : undefined,
                  { minHeight: 100, alignItems: 'center', justifyContent: 'center' },
                ]}>
                <View style={styles.cardContent}>
                  <Icon source={icons[type.icon as keyof typeof icons]} size={48} />
                  <Text variant='subtitle1'
                    style={[
                      eventType?.id === type.id ? styles.selectedText : undefined,
                      { flex: 1 },
                    ]}>
                    {type.name}
                  </Text>
                </View>
              </CustomSurface>
            </TouchableHighlight>
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
  },
  selectedText: {
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 16,
  },
});
