import { AdvancedMarker } from "@vis.gl/react-google-maps";
import type { Event } from "../src/types";
import { Icon } from "@mui/material";
import { iconDictionary } from "./utils/iconDictionary";

type EventMarkerProps = {
  event: Event;
  onPress: (event: Event) => void;
};

export const EventMarker = ({ event, onPress }: EventMarkerProps) => {
  const position = { lat: event.latitude, lng: event.longitude };

  return (
    <AdvancedMarker
      position={position}
      title={event.name}
      onClick={() => onPress(event)}
    >
      <Icon
        component={iconDictionary[event.eventType.icon]}
        sx={{ fontSize: 30 }}
        color="primary"
      />
    </AdvancedMarker>
  );
};
