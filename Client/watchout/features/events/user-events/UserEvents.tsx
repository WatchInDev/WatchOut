import { PageWrapper } from 'components/Common/PageWrapper';
import { Text } from 'components/Base/Text';
import { useUserEvents } from './useUserEvents';
import { ActivityIndicator, Button, Icon } from 'react-native-paper';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Event } from 'utils/types';
import { useEventDeactivate } from './useEventDeactivate';
import { useSnackbar } from 'utils/useSnackbar';
import { UserEventEntry } from './UserEventEntry';
import { ConfirmationModal } from 'components/Common/ConfirmationModal';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MapNavigationParams } from 'features/map/Map';
import { Row } from 'components/Base/Row';
import { theme } from 'utils/theme';

type EventFilter = 'active' | 'all';

const isEventActive = (event: Event) => {
  return event.isActive && new Date(event.endDate) > new Date();
};

export const UserEvents = () => {
  const { data: userEvents, isLoading, error } = useUserEvents();
  const navigation = useNavigation();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const { mutateAsync: deactivateEventAsync, isPending } = useEventDeactivate();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');

  const onEventDeactivatePressed = (eventId: number) => {
    setSelectedEventId(eventId);
  };

  const handleEventDeactivateAsync = async (eventId: number) => {
    try {
      await deactivateEventAsync(eventId);
      showSnackbar({ message: 'Zdarzenie zostało usunięte.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['events', 'user'] });
    } catch (e) {
      showSnackbar({ message: 'Wystąpił błąd podczas usuwania zdarzenia.', type: 'error' });
      console.error('Failed to deactivate event', e);
    }
  };

  const navigateToMap = (event: Event) => {
    navigation.navigate({
      name: 'Map',
      params: {
        selectedEventId: event.id,
        coordinates: { latitude: event.latitude, longitude: event.longitude },
      } as MapNavigationParams,
    } as never);
  };

  return (
    <PageWrapper>
      <FlatList
        data={userEvents?.filter((event) =>
          eventFilter === 'active' ? isEventActive(event) : true
        )}
        keyExtractor={(event) => event.id.toString()}
        ListHeaderComponent={() => (
          <Row style={{ justifyContent: 'space-between', gap: 12, marginVertical: 10 }}>
            <Button
              icon={eventFilter === 'active' ? 'check' : undefined}
              mode={eventFilter === 'active' ? 'contained' : 'outlined'}
              style={{ flex: 1 }}
              onPress={() => setEventFilter('active')}>
              Tylko aktywne
            </Button>
            <Button
              icon={eventFilter === 'all' ? 'check' : undefined}
              mode={eventFilter === 'all' ? 'contained' : 'outlined'}
              style={{ flex: 1 }}
              onPress={() => setEventFilter('all')}>
              Wszystkie
            </Button>
          </Row>
        )}
        renderItem={({ item: event }) => (
          <UserEventEntry
            event={event}
            isActive={isEventActive(event)}
            navigateToMap={navigateToMap}
            handleEventDeactivate={onEventDeactivatePressed}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() =>
          isLoading ? (
            <ActivityIndicator size={'large'} style={{ justifyContent: 'center', flex: 1 }} />
          ) : error ? (
            <Text>Wystąpił błąd podczas ładowania zdarzeń! Spróbuj ponownie później.</Text>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Icon source="folder" size={64} color={theme.palette.text.secondary} />
              <Text variant='h6'>Brak zdarzeń do wyświetlenia.</Text>
            </View>
          )
        }
      />
      <ConfirmationModal
        isVisible={selectedEventId !== null}
        content={'Czy na pewno chcesz usunąć to zdarzenie?'}
        onConfirm={async () => {
          if (selectedEventId != null) {
            await handleEventDeactivateAsync(selectedEventId);
            setSelectedEventId(null);
          }
        }}
        onCancel={() => setSelectedEventId(null)}
      />
    </PageWrapper>
  );
};
