import { useNavigation } from '@react-navigation/native';
import { FabButton } from 'components/Base/FabButton';
import { Text } from 'components/Base/Text';
import { PageWrapper } from 'components/Common/PageWrapper';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, IconButton } from 'react-native-paper';
import { theme } from 'utils/theme';

type Outage = {
  type: 'electrical_outage' | 'weather';
  location?: string;
  name?: string;
  description?: string;
  fromDate: Date;
  toDate: Date;
  provider?: string;
  locality?: string;
  placeName: string;
};

const outageIcons: Record<Outage['type'], string> = {
  electrical_outage: 'flash',
  weather: 'weather-cloudy',
};

const OUTAGES_MOCK: Outage[] = [
  {
    type: 'electrical_outage',
    name: 'Wyłączenia prądu',
    location: 'Kielecka 37',
    fromDate: new Date('2025-10-24T03:00:00.000+00:00'),
    toDate: new Date('2025-11-30T13:00:00.000+00:00'),
    provider: 'Tauron',
    placeName: 'string',
  },
  {
    type: 'weather',
    name: 'Gęsta mgła',
    description:
      'Prognozuje się gęste mgły, w zasięgu których widzialność może miejscami wynosić poniżej 200 m.',
    fromDate: new Date('2025-11-09T20:00:00.000+00:00'),
    toDate: new Date('2025-11-16T17:00:00.000+00:00'),
    locality: 'elbląski',
    placeName: 'string1',
  },
  {
    type: 'electrical_outage',
    name: 'Wyłączenia prądu',
    location: 'Kresowa',
    fromDate: new Date('2025-10-26T03:47:18.010+00:00'),
    toDate: new Date('2025-11-30T12:00:00.000+00:00'),
    provider: 'Tauron',
    placeName: 'string2',
  },
];

const TRACKED_LOCATIONS_MOCK = ['Kielce, Kielecka 37', 'Elbląg, powiat elbląski'];

export const Outages = () => {
  const navigation = useNavigation();

  return (
    <PageWrapper>
      <ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
          <View style={{ gap: 4, marginLeft: 8 }}>
            <Text>Śledzenie włączone dla:</Text>
            {TRACKED_LOCATIONS_MOCK.map((location) => (
              <Text key={location} variant="body1">
                {'\t'}• {location}
              </Text>
            ))}
          </View>
          <FabButton onPress={() => navigation.navigate('LocationSettings' as never)} iconName="cog" />
        </View>
        {OUTAGES_MOCK.map((outage) => (
          <CustomSurface key={outage.placeName} style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon source={outageIcons[outage.type]} size={64} />
              <Text variant="h3" style={{ flexShrink: 1 }}>
                {outage.name}
              </Text>
            </View>
            <View style={{ gap: 4 }}>
              <Text>
                <Text weight="bold">Operator:</Text> {outage.provider}
              </Text>
              <Text>
                <Text weight="bold">Od:</Text> {outage.fromDate.toLocaleString()}
              </Text>
              <Text>
                <Text weight="bold">Do:</Text> {outage.toDate.toLocaleString()}
              </Text>
              <Text>
                <Text weight="bold">Lokalizacja:</Text>{' '}
                {outage.location || 'powiat ' + outage.locality}
              </Text>
              {outage.description && <Text variant="body1">{outage.description}</Text>}
            </View>
          </CustomSurface>
        ))}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
});
