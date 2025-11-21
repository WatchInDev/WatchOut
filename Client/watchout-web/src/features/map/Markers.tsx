import { useMapViewport } from "./useMapViewport";
import { EventMarker } from "@/EventMarker";
import type { Event } from "@/types";
import { useGetEvents, useGetEventsClustered } from "../events/events.hooks";
import { ClusterMarker } from "./ClusterMarker";

const ZOOM_THRESHOLD = 12;

type MarkersProps = {
  onMarkerPress: (event: Event) => void;
};

export const Markers = ({ onMarkerPress }: MarkersProps) => {
  const { coordinatesRect, zoom } = useMapViewport();
  const { data: events } = useGetEvents(coordinatesRect, zoom > ZOOM_THRESHOLD);
  const { data: clusters } = useGetEventsClustered(
    { coordinates: coordinatesRect, minPoints: 1, eps: 0.1 },
    zoom <= ZOOM_THRESHOLD
  );

  return (
    <div>
      {(zoom > ZOOM_THRESHOLD && (
        <>
          {events?.map((event) => (
            <EventMarker key={event.id} event={event} onPress={onMarkerPress} />
          ))}
        </>
      )) || (
        <>
          {clusters?.map((cluster) => (
            <ClusterMarker
              key={`${cluster.latitude}-${cluster.longitude}`}
              cluster={cluster}
            />
          ))}
        </>
      )}
    </div>
  );
};
