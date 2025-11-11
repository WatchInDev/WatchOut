import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'components/Base/Text';
import { ActivityIndicator, Card, Icon } from 'react-native-paper';
import { ErrorDisplay } from 'components/Common/ErrorDisplay';
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
          <Text variant="body1">
            Poniżej znajdziesz listę rodzajów zdarzeń, które możesz zgłosić:
          </Text>
          {eventTypes.map((event) => (
            <CustomSurface key={event.id} style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Icon source={event.icon} size={64} />
                <Text variant="h3" style={{ flexShrink: 1 }}>
                  {event.name}
                </Text>
              </View>
              <Text variant="body1" color="secondary" style={{ textAlign: 'justify' }}>
                {event.description}
              </Text>
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
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
});
