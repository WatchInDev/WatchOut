import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { LongPressEvent, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from 'features/map/useLocation';
import { Event } from 'utils/types';
import { Button, Icon } from 'react-native-paper';
import { useRef, useState, useCallback, useEffect } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { EventBottomSheet } from 'features/events/EventBottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useMapLogic } from 'features/map/useMapLogic';
import { ClusterMarker } from './ClusterMarker';
import { EventMarker } from './EventMarker';
import { CreateEvent } from '../events/CreateEvent';

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
  },
});

const ZOOM_TO_EVENT_MILLISECONDS = 500;

export const Map = () => {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { location } = useLocation();
  const { events, clusters, isZoomedEnough, onRegionChangeComplete, refetch } = useMapLogic(
    mapRef as React.RefObject<MapView>
  );
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  useEffect(() => {
    if (location && mapRef.current) {
      console.log('Centering map to user location:', location);
      
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  }, []);

  const [newEventLocation, setNewEventLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const openCreateEventModal = (event: LongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setNewEventLocation(coordinate);
    setSelectedEvent(null);
    bottomSheetRef.current?.present();
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
      bottomSheetRef.current?.present();
    },
    [selectedEvent, mapRef]
  );

  const handleMapPress = useCallback(() => {
    setSelectedEvent(null);
    bottomSheetRef.current?.dismiss();
    setNewEventLocation(null);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        followsUserLocation={true}
        onPress={handleMapPress}
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
        }}
        moveOnMarkerPress={true}>
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
      <BottomSheetModal ref={bottomSheetRef} snapPoints={['40%']} index={0} enablePanDownToClose>
        <BottomSheetView>
          {selectedEvent && <EventBottomSheet event={selectedEvent} />}
          {newEventLocation && (
            <CreateEvent
              location={newEventLocation}
              onSuccess={() => {
                bottomSheetRef.current?.dismiss();
                setNewEventLocation(null);
                refetch();
              }}
            />
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </GestureHandlerRootView>
  );
};
