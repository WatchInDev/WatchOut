import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { Text } from 'components/Base/Text';
import { Event } from 'utils/types';
import dayjs from 'dayjs';

type EventDetailsProps = {
  event: Event;
};

export const EventDetails = ({ event }: EventDetailsProps) => {
  const reportedDateText = `${new Date(event.reportedDate).toLocaleString()} (${dayjs(event.reportedDate).fromNow()})`;

  return (
    <View>
      <View style={styles.header}>
        <Icon source={event.eventType.icon} size={64} />
        <Text style={styles.title}>{event.name}</Text>
      </View>
      <Text style={styles.reportedDate}>Zgłoszono: {reportedDateText}</Text>
      <Text style={styles.description}>{event.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    flexShrink: 1,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  reportedDate: {
    fontSize: 12,
  },
  description: {
    fontSize: 16,
  },
});