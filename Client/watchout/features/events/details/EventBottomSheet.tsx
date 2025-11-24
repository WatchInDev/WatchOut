import { Event } from 'utils/types';
import { StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { CommentList } from 'features/events/comments/CommentList';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Divider } from 'react-native-paper';
import { EventDetails } from 'features/events/details/EventDetails';
import { useRateEvent } from './useRate';
import { EventRating } from './EventRating';
import { useSnackbar } from 'utils/useSnackbar';

type EventBottomSheetProps = {
  event: Event;
  onClose: () => void;
};

export const EventBottomSheet = ({ event, onClose }: EventBottomSheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { mutateAsync: rateEventAsync } = useRateEvent(event.id);
  const { showSnackbar } = useSnackbar();

  const [isUpVoted, setIsUpVoted] = useState<boolean | null>(null); // TODO: load initial vote state from API

  const handleRateEvent = async (isUpvote: boolean) => {
    try {
      await rateEventAsync(isUpvote);
      showSnackbar({ message: 'Dziękujemy za ocenę zdarzenia!', type: 'success' });
      setIsUpVoted(isUpvote);
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

        <EventRating isUpVoted={isUpVoted} onRate={handleRateEvent} />

        <View>
          <CommentList eventId={event.id} />
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
