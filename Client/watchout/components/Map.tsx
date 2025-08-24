import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from 'hooks/useLocation';
import { useGetEvents } from 'hooks/useGetEvents';
import { Event } from 'utils/types';
import { Text } from 'components/Base/Text';
import { Icon } from 'react-native-paper';
import { useRef, useState, useMemo, useCallback } from 'react';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { EventBottomSheet } from './EventBottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

export const Map = () => {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { location } = useLocation();
  const { data: events } = useGetEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleMarkerPress = useCallback((event: Event) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: event.latitude,
        longitude: event.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
    setSelectedEvent(event);
    bottomSheetRef.current?.present();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
        region={{
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.05,
        }}
        moveOnMarkerPress={true}
      >
        {events?.map((event: Event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            title={event.name}
            description={event.description}
            onPress={() => handleMarkerPress(event)}
          >
            <Icon source={event.eventType.icon} size={32} />
          </Marker>
        ))}
      </MapView>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['40%']}
        index={0}
        enablePanDownToClose
      >
        <BottomSheetView>
          {selectedEvent ? (
            <EventBottomSheet event={selectedEvent} />
          ) : (
            <Text>No event selected</Text>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </GestureHandlerRootView>
  );
};