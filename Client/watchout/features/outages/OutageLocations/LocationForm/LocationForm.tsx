import { PageWrapper } from 'components/Common/PageWrapper';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'components/Base/Text';
import { useNavigation } from '@react-navigation/native';
import { IconWithTitle } from 'components/Common/IconWithTitle';
import { Row } from 'components/Base/Row';
import { useEffect, useState } from 'react';
import { AddLocationRequest, Coordinates } from 'utils/types';
import { CustomSwitch } from 'components/Base/CustomSwitch';
import { Button } from 'react-native-paper';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationTextInput } from 'components/Common/LocationTextInput';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { CustomSlider } from 'components/Base/CustomSlider';
import {
  DEFAULT_LOCATION_RADIUS_KM,
  MAX_LOCATION_RADIUS_KM,
  METERS_IN_KM,
  MIN_LOCATION_RADIUS_KM,
} from 'utils/constants';
import { reverseGeocode } from 'features/map/reverseGeocode';

type LocationFormProps = {
  initialLocation?: AddLocationRequest;
  submit: (location: AddLocationRequest) => void;
  isPending?: boolean;
};

const defaultLocation: AddLocationRequest = {
  placeName: '',
  latitude: 0,
  longitude: 0,
  settings: {
    services: {
      electricity: false,
      weather: false,
      eventTypes: [],
    },
    radius: DEFAULT_LOCATION_RADIUS_KM, // in km, converted to meters when submitting
  },
  notificationsEnable: false,
};

export const LocationForm = ({ initialLocation, submit, isPending }: LocationFormProps) => {
  const navigation = useNavigation();
  const [location, setLocation] = useState<AddLocationRequest>(initialLocation ?? defaultLocation);
  const [preloadedLocalization, setPreloadedLocalization] = useState<string | null>(null);

  useEffect(() => {
    if (initialLocation) {
      const geocodedPlaceName = async () => {
        const placeName = await reverseGeocode({
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
        });
        if (placeName) {
          setPreloadedLocalization(placeName);
        }
      };
      geocodedPlaceName();
    }
  }, [initialLocation, location.latitude, location.longitude]);

  useEffect(() => {
    if (initialLocation) {
      setLocation({
        ...initialLocation,
        settings: {
          ...initialLocation.settings,
          radius: initialLocation.settings.radius / METERS_IN_KM,
        },
      });
    }
  }, [initialLocation]);

  const handleSubmit = async () => {
    submit({
      ...location,
      settings: {
        ...location.settings,
        services: { ...location.settings.services, eventTypes: [] },
        radius: location.settings.radius * METERS_IN_KM,
      },
    });
    navigation.goBack();
  };

  const toggleService = (service: keyof AddLocationRequest['settings']['services']) => {
    setLocation((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        services: {
          ...prev.settings.services,
          [service]: !prev.settings.services[service],
        },
      },
    }));
  };

  const OutageSelect = ({
    service,
    label,
    iconName,
  }: {
    service: Exclude<keyof AddLocationRequest['settings']['services'], 'eventTypes'>;
    label: string;
    iconName: string;
  }) => {
    return (
      <TouchableOpacity onPress={() => toggleService(service)}>
        <IconWithTitle
          iconName={iconName}
          label={label}
          iconSize={50}
          isActive={location.settings.services[service]}
        />
      </TouchableOpacity>
    );
  };

  const handlePlaceSelect = (coordinates: Coordinates) => {
    setLocation((prev) => ({
      ...prev,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    }));
  };

  return (
    <PageWrapper>
      <SafeAreaView edges={['left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ gap: 16 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}>
          <CustomSurface style={styles.locationSurface}>
            <Text variant="h2">Nazwa lokalizacji</Text>
            <Text color="secondary">
              Wprowadź nazwę lokalizacji, aby łatwo ją rozpoznać w aplikacji (np. Dom, Praca)
            </Text>
            <CustomTextInput
              value={location.placeName}
              style={{ marginVertical: 4, marginHorizontal: 2 }}
              placeholder="Podaj nazwę lokalizacji"
              onChangeText={(text) => setLocation((prev) => ({ ...prev, placeName: text }))}
            />
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h2">Adres</Text>
            <Text color="secondary">
              Wprowadź adres lokalizacji, aby dokładnie określić jej położenie na mapie
            </Text>
            <LocationTextInput
              initialValue={preloadedLocalization || ''}
              onPlaceSelect={handlePlaceSelect}
            />
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h2">Usługi</Text>
            <Text color="secondary">
              Wybierz usługi dla których będziesz otrzymywać powiadomienia w przypadku ich
              planowanego wyłączenia
            </Text>
            <Row style={{ gap: 12, height: 80, marginTop: 24 }}>
              <OutageSelect service="electricity" label="Prąd" iconName="flash" />
              <OutageSelect service="weather" label="Pogoda" iconName="weather-partly-cloudy" />
            </Row>
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h2">Zasięg</Text>
            <Row>
              <Text>{MIN_LOCATION_RADIUS_KM} km</Text>
              <View style={{ flex: 1 }} />
              <Text>{MAX_LOCATION_RADIUS_KM} km</Text>
            </Row>
            <CustomSlider
              value={location.settings.radius}
              onValueChange={(value) =>
                setLocation((prev) => ({ ...prev, settings: { ...prev.settings, radius: value } }))
              }
              min={MIN_LOCATION_RADIUS_KM}
              max={MAX_LOCATION_RADIUS_KM}
              step={1}
            />
            <Text>
              <Text weight="bold">Obecny zasięg:</Text> {location.settings.radius} km
            </Text>
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h2">Powiadomienia</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text variant="body1" align="justify" style={{ flex: 1 }}>
                Otrzymuj powiadomienia push o przerwach w dostawie usług dla tej lokalizacji
              </Text>
              <CustomSwitch
                value={location.notificationsEnable}
                onValueChange={(value: boolean) =>
                  setLocation((prev) => ({ ...prev, notificationsEnable: value }))
                }
              />
            </View>
          </CustomSurface>

          <Button mode="contained" onPress={handleSubmit} loading={isPending} disabled={isPending}>
            Zatwierdź lokalizację
          </Button>
        </ScrollView>
      </SafeAreaView>
    </PageWrapper>
  );
};

const styles = StyleSheet.create({
  locationSurface: {
    padding: 16,
  },
});
