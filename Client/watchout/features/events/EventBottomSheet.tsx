import { Event } from 'utils/types';
import { Alert, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'components/Base/Text';
import { useEffect, useRef, useState } from 'react';
import { CommentList } from './comments/CommentList';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Button, Divider } from 'react-native-paper';
import { EventDetails } from './EventDetails';
import { theme } from 'utils/theme';
import { useRateEvent } from './useRate';

type EventBottomSheetProps = {
  event: Event;
  onClose: () => void;
};

export const EventBottomSheet = ({ event, onClose }: EventBottomSheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { mutateAsync: rateEventAsync } = useRateEvent(event.id);

  const [isUpVoted, setIsUpVoted] = useState<boolean | null>(null); // TODO: load initial vote state from API

  const handleRateEvent = async (isUpvote: boolean) => {
    try {
      await rateEventAsync(isUpvote);
      setIsUpVoted(isUpvote);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się ocenić zdarzenia.');
      console.error('Error rating event:', error);
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
        <View style={{ gap: 8 }}>
          <Text variant="body2" color="secondary" style={{ textAlign: 'center' }}>
            Czy potwierdzasz, że zdarzenie nadal ma miejsce?
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', gap: 12 }}>
            <Button
              mode="contained"
              onPress={() => handleRateEvent(true)}
              style={[{ flex: 1, padding: 0 }, voteOpacity(isUpVoted, true)]}>
              Tak
            </Button>
            <Button
              mode="contained"
              style={[{ flex: 1, backgroundColor: theme.palette.error }, voteOpacity(isUpVoted, false)]}
              onPress={() => handleRateEvent(false)}>
              Nie
            </Button>
          </View>
        </View>
        <View>
          <CommentList eventId={event.id} />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const voteOpacity = (isUpVoted: boolean | null, buttonIsUpvote: boolean): StyleProp<ViewStyle> => {
  if (isUpVoted === null) return { opacity: 1 };
  return { opacity: isUpVoted === buttonIsUpvote ? 1 : 0.5 };
}

const styles = StyleSheet.create({
  sections: {
    paddingHorizontal: 16,
    paddingBottom: 128,
    gap: 24,
  },
});
