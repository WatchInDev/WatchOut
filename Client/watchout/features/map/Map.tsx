import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { LongPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useUserLocation } from 'features/map/useLocation';
import { Coordinates, Event, EventFilters } from 'utils/types';
import { Icon } from 'react-native-paper';
import { useRef, useState, useCallback, useEffect } from 'react';
import { EventBottomSheet } from 'features/events/EventBottomSheet';
import { useMapLogic } from 'features/map/useMapLogic';
import { ClusterMarker } from './ClusterMarker';
import { EventMarker } from './EventMarker';
import { CreateEventBottomSheet } from 'features/events/create/CreateEventBottomSheet';
import { FilterButton } from './filters/FilterButton';
import { Filters } from './filters/Filters';
import { DEFAULT_REPORT_HOURS_FILTER, FILTERS_STORAGE_KEY } from 'utils/constants';
import { useGetEventTypes } from 'features/events/event-types.hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});

const ZOOM_TO_EVENT_MILLISECONDS = 500;

export const Map = () => {
  const mapRef = useRef<MapView>(null);
  const { location } = useUserLocation();
  const [filters, setFilters] = useState<EventFilters>({ hoursSinceReport: 2, eventTypesIds: [] });
  const { data: eventTypes } = useGetEventTypes();

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const storedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
        if (storedFilters) {
          setFilters(JSON.parse(storedFilters));
        }
      } catch (e) {
        console.error('Failed to load filters from storage', e);
      }
    };

    loadFilters();
  }, []);

  const { events, clusters, isZoomedEnough, onRegionChangeComplete, refetch } = useMapLogic(
    mapRef as React.RefObject<MapView>,
    filters
  );

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEventLocation, setNewEventLocation] = useState<Coordinates | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const openCreateEventModal = (event: LongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setNewEventLocation(coordinate);
    setSelectedEvent(null);
  };

  const handleMarkerPress = useCallback(
    (event: Event) => {
      if (selectedEvent?.id === event.id) {
        return;
      }
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: event.latitude,
            longitude: event.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          ZOOM_TO_EVENT_MILLISECONDS
        );
      }
      setSelectedEvent(event);
      setNewEventLocation(null);
    },
    [selectedEvent, mapRef]
  );

  const handleMapPress = useCallback(() => {
    setSelectedEvent(null);
    setNewEventLocation(null);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        followsUserLocation={true}
        onPress={() => {
          handleMapPress();
        }}
        onLongPress={openCreateEventModal}
        showsCompass={true}
        showsScale={true}
        showsMyLocationButton={true}
        onRegionChangeComplete={onRegionChangeComplete}
        region={{
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.05,
        }}>
        {!isZoomedEnough &&
          clusters?.map((cluster) => (
            <ClusterMarker key={`${cluster.latitude}-${cluster.longitude}`} cluster={cluster} />
          ))}

        {isZoomedEnough &&
          events?.map((event: Event) => (
            <EventMarker key={event.id} event={event} onPress={handleMarkerPress} />
          ))}

        {newEventLocation && (
          <Marker
            coordinate={newEventLocation}
            title="New Event"
            description="Create a new event here"
            pinColor="blue"
            anchor={{ x: 0.5, y: 0.5 }}>
            <Icon source="plus-circle" size={32} color="red" />
          </Marker>
        )}
      </MapView>
      {filtersVisible ? (
        <Filters
          isVisible={filtersVisible}
          onClose={() => setFiltersVisible(false)}
          filters={filters}
          setFilters={setFilters}
        />
      ) : (
        <FilterButton
          onClick={() => setFiltersVisible((prev) => !prev)}
          isDirty={
            filters.eventTypesIds.length < (eventTypes?.length ?? 0) ||
            filters.hoursSinceReport !== DEFAULT_REPORT_HOURS_FILTER
          }
          label="Filter Events"
        />
      )}
      {selectedEvent && (
        <EventBottomSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {newEventLocation && (
        <CreateEventBottomSheet
          location={newEventLocation}
          onClose={() => setNewEventLocation(null)}
          onSuccess={() => {
            setNewEventLocation(null);
            refetch();
          }}
        />
      )}
    </View>
  );
};
