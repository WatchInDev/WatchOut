import { MapMarker, Marker } from 'react-native-maps';
import { Event } from 'utils/types';
import { useRef } from 'react';

type EventMarkerProps = {
  event: Event;
  onPress: (event: Event) => void;
};

export const EventMarker = ({ event, onPress }: EventMarkerProps) => {
  const markerRef = useRef<MapMarker>(null);

  return (
    <Marker
      key={event.id}
      ref={markerRef}
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{
        latitude: event.latitude,
        longitude: event.longitude,
      }}
      tracksViewChanges={true}
      onPress={() => onPress(event)}>
    </Marker>
  );
};
