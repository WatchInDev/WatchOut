import React, { useRef, useState, useCallback, useEffect, use } from "react";
import { useUserLocation } from "./useLocation";
import type { Coordinates, CoordinatesRect, Event } from "../../types";
import { EventBottomSheet } from "../events/EventBottomSheet";
import { CreateEventBottomSheet } from "../events/CreateEventBottomSheet";
import {
  Map,
  AdvancedMarker,
  APIProvider,
  Marker,
} from "@vis.gl/react-google-maps";
import { Markers } from "./Markers";


const CONTAINER_STYLE = {
  width: "100vw",
  height: "100vh",
};

const DEFAULT_CENTER = { lat: 51.163, lng: 17.08 };
const ZOOM_TO_EVENT = 15;
const DEFAULT_ZOOM = 14;

export const EventMap = () => {
  const map = useRef<google.maps.Map | null>(null);
  const { location } = useUserLocation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEventLocation, setNewEventLocation] = useState<Coordinates | null>(
    null
  );

  const handleRightClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const coordinate = { latitude: e.latLng.lat(), longitude: e.latLng.lng() };
    setNewEventLocation(coordinate);
    setSelectedEvent(null);
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedEvent(null);
    setNewEventLocation(null);
  }, []);

  const handleMarkerPress = useCallback(
    (event: Event) => {
      if (selectedEvent?.id === event.id || !map) return;
      map.current?.moveCamera({
        center: { lat: event.latitude, lng: event.longitude },
        zoom: ZOOM_TO_EVENT,
        heading: 0,
        tilt: 0,
      });
      setSelectedEvent(event);
      setNewEventLocation(null);
    },
    [selectedEvent, map]
  );

  return (
    <div style={CONTAINER_STYLE}>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultZoom={DEFAULT_ZOOM}
          gestureHandling="greedy"
          mapId={"739af084373f96fe"}
          mapTypeId={'roadmap'}
          
          renderingType={"RASTER"}
          disableDefaultUI
          onClick={handleMapClick} 
          defaultCenter={
            location
              ? { lat: location.latitude, lng: location.longitude }
              : DEFAULT_CENTER
          }
        >
          <Markers onMarkerPress={handleMarkerPress} />
          {newEventLocation && (
            <Marker
              position={{
                lat: newEventLocation.latitude,
                lng: newEventLocation.longitude,
              }}
              clickable={false}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "red",
                fillOpacity: 1,
                strokeWeight: 0,
              }}
              title="New Event"
            />
          )}
        </Map>
      </APIProvider>
      {selectedEvent && <EventBottomSheet event={selectedEvent} />}
      {newEventLocation && (
        <CreateEventBottomSheet
          location={newEventLocation}
          onSuccess={() => {
            setNewEventLocation(null);
          }}
        />
      )}
    </div>
  );
};
