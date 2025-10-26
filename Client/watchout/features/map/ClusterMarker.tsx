import { Marker } from 'react-native-maps';
import { EventCluster } from 'utils/types';
import { StyleSheet, View } from 'react-native';
import { Text } from 'components/Base/Text';
import { theme } from 'utils/theme';

type ClusterMarkerProps = {
  cluster: EventCluster;
};

type PulsatingCircleProps = {
  count: number;
  size?: number;
  pulseSizeMultiplier?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  pulseColor?: string;
};

const PulsatingCircle = ({
  count,
  size = 30,
  pulseSizeMultiplier = 1.3,
  backgroundColor = theme.palette.primary,
  textColor = theme.palette.text.primaryInverse,
  borderColor = '#FFFFFF',
  pulseColor = 'rgba(72, 188, 255, 0.3)',
}: PulsatingCircleProps) => {
  const pulseOuterSize = size * pulseSizeMultiplier;
  const pulseInnerSize = size * 1.15;

  return (
    <View
      style={[
        mapClusterStyles.container,
        {
          width: pulseOuterSize,
          height: pulseOuterSize,
        },
      ]}>
      <View
        style={[
          mapClusterStyles.pulseOuter,
          {
            width: pulseOuterSize,
            height: pulseOuterSize,
            borderRadius: pulseOuterSize / 2,
            backgroundColor: pulseColor,
          },
        ]}
      />
      <View
        style={[
          mapClusterStyles.pulseInner,
          {
            width: pulseInnerSize,
            height: pulseInnerSize,
            borderRadius: pulseInnerSize / 2,
            backgroundColor: pulseColor,
          },
        ]}
      />
      <View
        style={[
          mapClusterStyles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
          },
        ]}>
        <Text
          color="primaryInverse"
          style={[mapClusterStyles.text, { color: textColor, fontSize: size * 0.4 }]}>
            {count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : count}
        </Text>
      </View>
    </View>
  );
};

const mapClusterStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    elevation: 2,
    zIndex: 2,
  },
  text: {
    fontWeight: 'bold',
  },
  pulseOuter: {
    position: 'absolute',
    opacity: 0.5,
    zIndex: 0,
  },
  pulseInner: {
    position: 'absolute',
    opacity: 0.7,
    zIndex: 1,
  },
});

export default PulsatingCircle;

export const ClusterMarker = ({ cluster }: ClusterMarkerProps) => {
  return (
    <Marker
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{
        latitude: cluster.latitude,
        longitude: cluster.longitude,
      }}
      title={`Grupa ${cluster.count} zdarzeń`}
      description={`W tej okolicy znajduje się ${cluster.count} zdarzeń.`}>
      <PulsatingCircle count={cluster.count} />
    </Marker>
  );
};
