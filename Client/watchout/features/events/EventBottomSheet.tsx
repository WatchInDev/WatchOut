import { Event } from 'utils/types';
import { StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { CommentList } from './comments/CommentList';
import { Pictures } from './comments/Pictures';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Button, Divider } from 'react-native-paper';
import { EventDetails } from './EventDetails';
import { Pictures } from './Pictures'

type EventBottomSheetProps = {
  event: Event;
  onClose: () => void;
};

export const EventBottomSheet = ({ event, onClose }: EventBottomSheetProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

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
          <Divider style={{ marginTop: 32 }} />
        </View>
        <View>
          <CommentList eventId={event.id} />
          <Divider style={{ marginTop: 32 }} />
        </View>
        <View>
          <Pictures />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sections: {
    paddingHorizontal: 16,
    paddingBottom: 128,
    gap: 32,
  },
});
