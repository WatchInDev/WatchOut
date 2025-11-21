import { PageWrapper } from 'components/Common/PageWrapper';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'components/Base/Text';
import { useNavigation } from '@react-navigation/native';
import { OutageButton } from 'features/outages/OutageButton';
import { Row } from 'components/Base/Row';
import { useState } from 'react';
import { AddLocationRequest, Coordinates } from 'utils/types';
import { Slider } from '@miblanchard/react-native-slider';
import { theme } from 'utils/theme';
import { CustomSwitch } from 'components/Base/CustomSwitch';
import { Button } from 'react-native-paper';
import { useLocationCreate } from './useLocationCreate';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationTextInput } from 'components/Common/LocationTextInput';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { useQueryClient } from '@tanstack/react-query';

const MIN_RADIUS = 0;
const MAX_RADIUS = 50;

export const AddLocation = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState<AddLocationRequest>({
    placeName: '',
    latitude: 0,
    longitude: 0,
    services: {
      electricity: false,
      water: false,
      gas: false,
      internet: false,
    },
    radius: 0,
    notificationsEnabled: false,
  });

  const { mutateAsync: createLocationAsync, isPending } = useLocationCreate();

  const handleSubmit = async () => {
    console.log('Submitting location:', JSON.stringify(location, null, '\t'));
    await createLocationAsync(location);
    queryClient.invalidateQueries({ queryKey: ['pinnedLocations'] });
    navigation.goBack();
  };

  const toggleService = (service: keyof AddLocationRequest['services']) => {
    setLocation((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service],
      },
    }));
  };

  const OutageSelect = ({
    service,
    label,
    iconName,
  }: {
    service: keyof AddLocationRequest['services'];
    label: string;
    iconName: string;
  }) => {
    return (
      <TouchableOpacity onPress={() => toggleService(service)}>
        <OutageButton
          iconName={iconName}
          label={label}
          iconSize={50}
          isActive={location.services[service]}
        />
      </TouchableOpacity>
    );
  };

  const handlePlaceSelect = (coordinates: Coordinates) => {
    console.log('Selected place:', JSON.stringify(coordinates, null, '\t'));
    setLocation((prev) => ({
      ...prev,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    }));
  };

  return (
    <PageWrapper>
      <SafeAreaView edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={{ gap: 16 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>

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
            <LocationTextInput onPlaceSelect={handlePlaceSelect} />
          </CustomSurface>
          
          <CustomSurface style={styles.locationSurface}>
            <Text variant="h2">Usługi</Text>
            <Text color="secondary">
              Wybierz usługi dla których będziesz otrzymywać powiadomienia w przypadku ich
              planowanego wyłączenia
            </Text>
            <Row style={{ justifyContent: 'space-between', height: 80, marginTop: 24 }}>
              <OutageSelect service="electricity" label="Prąd" iconName="flash" />
              <OutageSelect service="water" label="Woda" iconName="water-off" />
              <OutageSelect service="gas" label="Gaz" iconName="fire" />
              <OutageSelect service="internet" label="Sieć" iconName="wifi" />
            </Row>
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h2">Zasięg</Text>
            <Row>
              <Text>{MIN_RADIUS} km</Text>
              <View style={{ flex: 1 }} />
              <Text>{MAX_RADIUS} km</Text>
            </Row>
            <Slider
              value={location.radius}
              onValueChange={([value]) => setLocation((prev) => ({ ...prev, radius: value }))}
              step={1}
              trackStyle={{ height: 16, borderRadius: 7.5 }}
              thumbStyle={{ width: 32, height: 32, borderRadius: 16 }}
              thumbTintColor={theme.palette.text.primary}
              minimumTrackTintColor={theme.palette.primary}
              maximumTrackTintColor={theme.palette.tertiary}
              minimumValue={MIN_RADIUS}
              maximumValue={MAX_RADIUS}
            />
            <Text>
              <Text weight="bold">Obecny zasięg:</Text> {location.radius} km
            </Text>
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h2">Powiadomienia</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text variant="body1" align='justify' style={{ flex: 1 }}>
                Otrzymuj powiadomienia push o przerwach w dostawie usług dla tej lokalizacji
              </Text>
              <CustomSwitch
                value={location.notificationsEnabled}
                onValueChange={(value: boolean) =>
                  setLocation((prev) => ({ ...prev, notificationsEnabled: value }))
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
  }
});
