import { Marker } from 'react-native-maps';
import { EventCluster } from 'utils/types';
import { Icon } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { Text } from 'components/Base/Text';

interface ClusterMarkerProps {
  cluster: EventCluster;
}

const styles = StyleSheet.create({
  clusterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 40,
  },
  clusterView: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
  }
});

export const ClusterMarker = ({ cluster }: ClusterMarkerProps) => (
  <Marker
    anchor={{ x: 0.5, y: 0.5 }}
    coordinate={{
      latitude: cluster.latitude,
      longitude: cluster.longitude,
    }}
    title={`Cluster of ${cluster.count} events`}
    description={`There are ${cluster.count} events in this area.`}>
    <Icon source="circle" size={40} />
    <View style={styles.clusterView}>
      <Text style={styles.clusterText}>{cluster.count}</Text>
    </View>
  </Marker>
);