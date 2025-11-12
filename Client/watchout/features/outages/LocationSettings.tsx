import React from 'react';
import { Text } from 'components/Base/Text';
import { View } from 'react-native';
import { PageWrapper } from 'components/Common/PageWrapper';
import { useNavigation } from '@react-navigation/native';
import { FabButton } from 'components/Base/FabButton';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { Icon, IconButton } from 'react-native-paper';
import { theme } from 'utils/theme';
import { Row } from 'components/Base/Row';

type TrackedLocation = {
  id: number;
  city: string;
  address: string;
  range: number;
  areNotificationsEnabled: boolean;
};

const TRACKED_LOCATIONS: TrackedLocation[] = [
  {
    id: 1,
    city: 'Wrocław',
    address: 'Plac Grunwaldzki 22/37',
    range: 2,
    areNotificationsEnabled: true,
  },
  {
    id: 2,
    city: 'Gdańsk',
    address: 'Długa 45',
    range: 15,
    areNotificationsEnabled: false,
  },
  {
    id: 3,
    city: 'Poznań',
    address: 'Świętego Marcina 10',
    range: 5,
    areNotificationsEnabled: false,
  },
];

export const LocationSettings = () => {
  const navigation = useNavigation();

  return (
    <PageWrapper>
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}>
        <Text variant="h3">Śledzone lokalizacje</Text>
        <FabButton onPress={() => navigation.goBack()} iconName="plus" />
      </View>
      <View>
        {TRACKED_LOCATIONS.map((location) => (
          <CustomSurface
            key={location.id}
            style={{
              padding: 12,
              marginBottom: 12,
              gap: 4,
            }}>
            <View
              style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                flexShrink: 1,
              }}>
              <Icon source="map-marker" size={32} color={theme.palette.text.secondary} />
              <Text weight="bold" variant="h6" color="secondary" wrap>
                {location.city}
                <Text variant="h6" color="secondary">
                  , {location.address}
                </Text>
              </Text>
              <Row style={{ alignItems: 'center' }}>
                <IconButton
                  icon="pencil-outline"
                  size={26}
                  style={{ margin: 0, padding: 0 }}
                  onPress={() => {}}
                />
                <IconButton
                  icon="delete-outline"
                  size={26}
                  style={{ margin: 0, padding: 0 }}
                  onPress={() => {}}
                />
              </Row>
            </View>
            <Row>
              <FabButton
                onPress={() => {}}
                iconName='flash'
              />
              <FabButton
                onPress={() => {}}
                iconName='flash'
              />
              <FabButton
                onPress={() => {}}
                iconName='flash'
              />
              <FabButton
                onPress={() => {}}
                iconName='flash'
              />
            </Row>
            <View style={{ gap: 8 }}>
              <Row style={{ alignItems: 'center', gap: 8}}>
                <Icon source='radius-outline' size={24} />
                <Text><Text weight='bold'>Zasięg: </Text>{location.range} km</Text>
              </Row>
              <Row style={{ alignItems: 'center', gap: 8}}>
                <Icon source='bell-outline' size={24} />
                <Text><Text weight='bold'>Powiadomienia: </Text>{location.areNotificationsEnabled ? 'Włączone' : 'Wyłączone'}</Text>
              </Row>
            </View>
          </CustomSurface>
        ))}
      </View>
    </PageWrapper>
  );
};
