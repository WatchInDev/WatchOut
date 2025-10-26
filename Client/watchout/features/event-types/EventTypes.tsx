import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'components/Base/Text';
import { ActivityIndicator, Card, Icon } from 'react-native-paper';
import { ErrorDisplay } from '../../components/Common/ErrorDisplay';
import { useGetEventTypes } from 'features/events/event-types.hooks';
import { CustomSurface } from 'components/Layout/CustomSurface';

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
      {isPending && <ActivityIndicator size="large" style={styles.loader} />}
      {eventTypes && (
        <ScrollView style={styles.scrollView}>
          <Text>Poniżej znajdziesz listę rodzajów zdarzeń, które możesz zgłosić:</Text>
          {eventTypes.map((event, index) => (
            <CustomSurface key={index} style={styles.card}>
              <View style={styles.cardContent}>
                <Icon source={event.icon} size={64} />
                <View style={styles.textContainer}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text>{event.description}</Text>
                </View>
              </View>
            </CustomSurface>
          ))}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginVertical: 48,
  },
  scrollView: {
    marginVertical: 24,
    paddingHorizontal: 12,
  },
  card: {
    marginBottom: 16,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
