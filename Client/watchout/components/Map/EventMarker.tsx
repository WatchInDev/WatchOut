import { Marker } from 'react-native-maps';
import { Event } from 'utils/types';
import { Icon } from 'react-native-paper';

interface EventMarkerProps {
  event: Event;
  onPress: (event: Event) => void;
}

export const EventMarker = ({ event, onPress }: EventMarkerProps) => (
  <Marker
    key={event.id}
    anchor={{ x: 0.5, y: 0.5 }}
    coordinate={{
      latitude: event.latitude,
      longitude: event.longitude,
    }}
    title={event.name}
    description={event.description}
    onPress={() => onPress(event)}>
    <Icon source={event.eventType.icon} size={32} />
  </Marker>
);