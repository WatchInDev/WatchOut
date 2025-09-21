import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from 'hooks/useLocation';
import { useGetEvents, useGetEventsClustered } from 'hooks/events.hooks';
import { Image } from 'react-native';
import { Event, EventCluster } from 'utils/types';
import { Text } from 'components/Base/Text';
import { Icon } from 'react-native-paper';
import { useRef, useState, useCallback } from 'react';
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
  const [mapBounds, setMapBounds] = useState({
    neLat: 0,
    neLng: 0,
    swLat: 0,
    swLng: 0
  });
  const [isZoomedEnough, setIsZoomedEnough] = useState(false);

  const { data: events } = useGetEvents(mapBounds);
  const { data: clusters } = useGetEventsClustered(mapBounds, 2);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleMarkerPress = (event: Event) => {
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
        500
      );
    }
    setSelectedEvent(event);
    bottomSheetRef.current?.present();
  };

  const handleMapPress = () => {
    setSelectedEvent(null);
    bottomSheetRef.current?.dismiss();
  };

  const EventMarker = ({ event }: { event: Event }) => (
    <Marker
      key={event.id}
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{
        latitude: event.latitude,
        longitude: event.longitude,
      }}
      title={event.name}
      description={event.description}
      onPress={() => handleMarkerPress(event)}>
      <Icon source={event.eventType.icon} size={32} />
    </Marker>
  );

  const ClusterMarker = ({ cluster }: { cluster: EventCluster }) => (
    <Marker
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{
        latitude: cluster.latitude,
        longitude: cluster.longitude,
      }}
      title={`Cluster of ${cluster.count} events`}
      description={`There are ${cluster.count} events in this area.`}
    >
      <Icon source="circle" size={40} />
      <View className='text-center justify-center items-center' style={{ position: 'absolute', left: 0, top: 0, width: 40, height: 40 }}>
        <Text
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 1,
            textAlign: 'center',
            textAlignVertical: 'center',
            lineHeight: 40,
          }}
        >{cluster.count}</Text>
      </View>
    </Marker>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        followsUserLocation={true}
        onPress={handleMapPress}
        showsMyLocationButton={true}
        region={{
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.05,
        }}
        moveOnMarkerPress={true}
        onRegionChangeComplete={updateMapBounds => {
          const { latitude, longitude, latitudeDelta, longitudeDelta } = updateMapBounds;
          setMapBounds({
            neLat: latitude + latitudeDelta / 2,
            neLng: longitude + longitudeDelta / 2,
            swLat: latitude - latitudeDelta / 2,
            swLng: longitude - longitudeDelta / 2
          });

          const zoomThreshold = 0.1;
          setIsZoomedEnough(latitudeDelta <= zoomThreshold);
        }}>
        {!isZoomedEnough && clusters?.map((cluster) => (
          <ClusterMarker
            key={`${cluster.latitude}-${cluster.longitude}`}
            cluster={cluster}
          />
        ))}
        {isZoomedEnough && events?.map((event: Event) => (
          <EventMarker
            key={event.id}
            event={event}
          />
        ))}
      </MapView>
      <BottomSheetModal ref={bottomSheetRef} snapPoints={['40%']} index={0} enablePanDownToClose>
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
