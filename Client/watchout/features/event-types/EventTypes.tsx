import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'components/Base/Text';
import { ActivityIndicator, Card, Icon } from 'react-native-paper';
import { ErrorDisplay } from '../../components/Common/ErrorDisplay';
import { useGetEventTypes } from 'features/events/event-types.hooks';

export const EventTypes = () => {
  const { data: eventTypes = [], isPending, isError } = useGetEventTypes();

  if (isPending) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (isError) {
    return <ErrorDisplay />;
  }

  return (
    <>
      <Text style={styles.title}>
        Rodzaje zdarzeń
      </Text>
      {isPending && <ActivityIndicator size="large" style={styles.loader} />}
      {eventTypes && (
        <ScrollView style={styles.scrollView}>
          {eventTypes.map((event, index) => (
            <Card key={index} mode="contained" style={styles.card}>
              <View style={styles.cardContent}>
                <Icon source={event.icon} size={64} />
                <View style={styles.textContainer}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text>{event.description}</Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    lineHeight: 50,
    paddingVertical: 32,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 48,
    letterSpacing: 0,
  },
  loader: {
    marginVertical: 48,
  },
  scrollView: {
    marginBottom: 56,
    paddingHorizontal: 12,
  },
  card: {
    marginBottom: 16,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardContent: {
    margin: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  textContainer: {
    flex: 1,
  },
  eventName: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});
