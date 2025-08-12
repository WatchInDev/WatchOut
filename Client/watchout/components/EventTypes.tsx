import { View, ScrollView } from "react-native";
import { Text } from "components/Base/Text";
import { Card, Icon } from "react-native-paper";
import { useGetEventTypes } from "hooks/useGetEventTypes";

export const EventTypes = () => {
  const { data: eventTypes = [], isPending } = useGetEventTypes();

  if (isPending) {
    return <Text>Loading...</Text>;
  }
  
  return (
    <>
      <Text className='text-5xl font-semibold py-8 text-center tracking-normal'>Rodzaje zdarzeń</Text>
      <ScrollView className='px-3 mb-14'>
        {eventTypes.map((event, index) => (
          <Card key={index} mode="contained" className='flex-1 mb-4 px-4 py-4'>
            <View className='flex flex-row items-center gap-4 m-2'>
              <Icon source={event.icon} size={64} />
              <View className="flex-1">
                <Text className='text-2xl font-bold'>{event.name}</Text>
                <Text className='font-light'>{event.description}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </>
  );
}