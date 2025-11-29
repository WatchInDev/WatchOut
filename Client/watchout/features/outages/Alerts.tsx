import { useNavigation } from '@react-navigation/native';
import { FabButton } from 'components/Base/FabButton';
import { Text } from 'components/Base/Text';
import { PageWrapper } from 'components/Common/PageWrapper';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon } from 'react-native-paper';
import { useAlerts } from './useAlerts';
import { usePinnedLocations } from './usePinnedLocations';
import { Row } from 'components/Base/Row';
import { formatDate } from 'utils/helpers';
import { Alert } from 'utils/types';

const outageIcons: Record<Alert['type'], string> = {
  electrical_outage: 'flash',
  weather: 'weather-cloudy',
};

export const Alerts = () => {
  const navigation = useNavigation();
  const { data: alerts, isLoading } = useAlerts();
  const { data: pinnedLocations, isLoading: isPinnedLocationsLoading } = usePinnedLocations();

  return (
    <PageWrapper>
      <ScrollView>
        <Row style={{ justifyContent: 'space-between', paddingVertical: 8 }}>
          <View style={{ gap: 4, marginLeft: 8, flex: 3, flexShrink: 1 }}>
            <Text>Śledzenie włączone dla:</Text>
            {isPinnedLocationsLoading ? (
              <ActivityIndicator size="small" style={{ marginVertical: 8 }} />
            ) : pinnedLocations?.length === 0 ? (
              <Text style={{ fontStyle: 'italic' }}>Brak śledzonych lokalizacji</Text>
            ) : null}
            {pinnedLocations?.map((location) => (
              <Text style={{ marginLeft: 8 }} key={location.id} wrap>
                • {location.region} , {location.location}
              </Text>
            ))}
          </View>
          <FabButton
            onPress={() => navigation.navigate('LocationSettings' as never)}
            iconName="cog"
          />
        </Row>
        {isLoading && <ActivityIndicator size="large" style={styles.loader} />}
        {alerts?.map((alert) => {
          const isEventOngoing = new Date(alert.toDate) > new Date();

          return (
            <CustomSurface
              key={alert.name + (alert.placeName || '') + new Date(alert.fromDate).toISOString()}
              style={styles.card}>
              <Row style={{ alignItems: 'center', gap: 8 }}>
                <Icon source={outageIcons[alert.type as keyof typeof outageIcons]} size={48} />
                <Text variant="h3" style={{ flexShrink: 1 }}>
                  {alert.name}
                </Text>
              </Row>
              <View style={{ gap: 4 }}>
                {isEventOngoing && (
                  <Text variant="h4" weight="bold" style={{ color: 'green' }}>
                    Obecnie trwa
                  </Text>
                )}
                <Text>
                  <Text weight="bold">Operator:</Text>{' '}
                  {alert.provider || <Text style={{ fontStyle: 'italic' }}>Brak danych</Text>}
                </Text>
                <Text>
                  <Text weight="bold">Od:</Text> {formatDate(new Date(alert.fromDate))}
                </Text>
                <Text>
                  <Text weight="bold">Do:</Text> {formatDate(new Date(alert.toDate))}
                </Text>
                <Text>
                  <Text weight="bold">Lokalizacja:</Text>{' '}
                  {alert.location || 'powiat ' + alert.locality}
                </Text>
                {alert.description && <Text variant="body1">{alert.description}</Text>}
              </View>
            </CustomSurface>
          );
        })}
      </ScrollView>
    </PageWrapper>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginVertical: 48,
  },
  scrollView: {
    paddingHorizontal: 12,
  },
  card: {
    marginBottom: 16,
    flex: 1,
    flexDirection: 'column',
    padding: 16,
    gap: 2,
  },
});
