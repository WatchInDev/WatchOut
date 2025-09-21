import { Text } from "components/Base/Text";
import { Event } from "utils/types";
import { View } from "react-native";
import { Icon } from "react-native-paper";

export const EventBottomSheet = ({ event }: { event: Event }) => {
  return (
    <View className="px-6 mb-8">
      <View className='flex flex-row items-center gap-4 mb-4'>
        <Icon source={event.eventType.icon} size={64} />
        <Text className='text-4xl font-bold'>{event.name}</Text>
      </View>
      <Text className='text-sm'>Zgłoszono: {new Date(event.reportedDate).toLocaleString()}</Text>
      <Text className='text-lg'>{event.description}</Text>
    </View>
  );
}