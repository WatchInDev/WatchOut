import { View, ScrollView } from 'react-native';
import { Text } from 'components/Base/Text';
import { ActivityIndicator, Card, Icon } from 'react-native-paper';
import { ErrorDisplay } from './Common/ErrorDisplay';
import { useGetEventTypes } from 'hooks/event-types.hooks';

export const EventTypes = () => {
  const { data: eventTypes = [], isPending, isError } = useGetEventTypes();

  if (isPending) {
    return <ActivityIndicator size="large" className="my-12" />;
  }

  if (isError) {
    return <ErrorDisplay />;
  }

  return (
    <>
      <Text style={{ lineHeight: 50 }} className="py-8 text-center font-semibold text-5xl tracking-normal">
        Rodzaje zdarzeń
      </Text>
      {isPending && <ActivityIndicator size="large" className="my-12" />}
      {eventTypes && (
        <ScrollView className="mb-14 px-3">
          {eventTypes.map((event, index) => (
            <Card key={index} mode="contained" className="mb-4 flex-1 px-4 py-4">
              <View className="m-2 flex flex-row items-center gap-4">
                <Icon source={event.icon} size={64} />
                <View className="flex-1">
                  <Text className="font-bold text-xl">{event.name}</Text>
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
