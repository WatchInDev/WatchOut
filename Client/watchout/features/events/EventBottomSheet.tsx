import { Text } from 'components/Base/Text';
import { Event } from 'utils/types';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { CommentList } from './comments/CommentList';
import { Pictures } from './comments/Pictures';
import { EventDetails } from './comments/EventDetails';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { Divider } from 'react-native-paper';

type EventBottomSheetProps = {
  event: Event;
};

export const EventBottomSheet = ({ event }: EventBottomSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <BottomSheetModal ref={bottomSheetRef} snapPoints={['40%']} index={0} enablePanDownToClose>
      <BottomSheetView>
        <BottomSheetScrollView contentContainerStyle={styles.sections}>
          <View>
            <EventDetails event={event} />
            <Divider style={{ marginTop: 32 }} />
          </View>
          <View>
            <CommentList eventId={event.id} />
            <Divider style={{ marginTop: 32 }} />
          </View>
          <Pictures />
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sections: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 32,
  },
});
