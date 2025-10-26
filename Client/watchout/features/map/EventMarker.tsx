import { Marker } from 'react-native-maps';
import { Event } from 'utils/types';
import { icons } from 'components/Base/icons';

type EventMarkerProps = {
  event: Event;
  onPress: (event: Event) => void;
};

export const EventMarker = ({ event, onPress }: EventMarkerProps) => {
  return (
    <Marker
      key={event.id}
      icon={icons[event.eventType.icon] || icons}
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{
        latitude: event.latitude,
        longitude: event.longitude,
      }}
      onPress={() => onPress(event)}
    />
  );
};
