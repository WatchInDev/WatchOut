import { Event } from 'utils/types';
import { Text } from 'components/Base/Text';
import { StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { CommentList } from 'features/events/comments/CommentList';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Divider } from 'react-native-paper';
import { EventDetails } from 'features/events/details/EventDetails';
import { useRateEvent } from './useRate';
import { EventRating } from './EventRating';
import { useSnackbar } from 'utils/useSnackbar';
import { useQueryClient } from '@tanstack/react-query';

type EventBottomSheetProps = {
  event: Event;
  onClose: () => void;
};

export const EventBottomSheet = ({ event, onClose }: EventBottomSheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { mutateAsync: rateEventAsync } = useRateEvent(event.id);
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [isUpVoted, setIsUpVoted] = useState<boolean | null>(
    event.ratingForCurrentUser === 1 ? true : event.ratingForCurrentUser === -1 ? false : null
  );

  const handleRateEvent = async (isUpvote: boolean) => {
    try {
      await rateEventAsync(isUpvote);
      showSnackbar({ message: 'Dziękujemy za ocenę zdarzenia!', type: 'success' });
      setIsUpVoted(isUpvote);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch {
      showSnackbar({ message: 'Nie udało się ocenić zdarzenia.', type: 'error' });
    }
  };

  useEffect(() => {
    bottomSheetRef.current?.expand();
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['40%']}
      index={0}
      enablePanDownToClose
      onClose={onClose}>
      <BottomSheetScrollView contentContainerStyle={styles.sections}>
        <View>
          <EventDetails event={event} />
          <Divider style={{ marginTop: 16 }} />
        </View>

        {event.isAuthor ? (
          <View>
            <Text>Jako autor zdarzenia nie możesz ocenić własnego zgłoszenia.</Text>
          </View>
        ) : (
          <EventRating isUpVoted={isUpVoted} onRate={handleRateEvent} />
        )}

        <View>
          <CommentList
            eventId={event.id}
            eventCoordinates={{ latitude: event.latitude, longitude: event.longitude }}
            eventAuthorId={event.author.id}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sections: {
    paddingHorizontal: 16,
    paddingBottom: 128,
    gap: 24,
  },
});
