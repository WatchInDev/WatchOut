import { StyleSheet, View, Image } from 'react-native';
import { Text } from 'components/Base/Text';
import { Event } from 'utils/types';
import dayjs from 'dayjs';
import { icons } from 'components/Base/icons';

type EventDetailsProps = {
  event: Event;
};

export const EventDetails = ({ event }: EventDetailsProps) => {
  const reportedDateText = `${new Date(event.reportedDate).toLocaleString()} (${dayjs(event.reportedDate).fromNow()})`;

  return (
    <View style={{ gap: 4 }}>
      <View style={styles.header}>
        <Image
          source={icons[(event.eventType.icon as keyof typeof icons) || 'alert-circle']}
          style={{ width: 64, height: 64 }}
        />
        <Text variant="h2" style={{ flexShrink: 1 }}>
          {event.name}
        </Text>
      </View>
      <Text variant="body2">Zgłoszono: {reportedDateText}</Text>
      <Text>{event.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    flexShrink: 1,
    fontWeight: 'bold',
    lineHeight: 40,
  },
});
