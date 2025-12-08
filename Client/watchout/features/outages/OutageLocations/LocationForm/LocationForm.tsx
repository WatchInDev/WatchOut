import { PageWrapper } from 'components/Common/PageWrapper';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'components/Base/Text';
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
import { Controller, useForm } from 'react-hook-form';

type LocationFormProps = {
  initialLocation?: AddLocationRequest;
  submit: (location: AddLocationRequest) => void;
  isPending?: boolean;
};

const defaultLocation: Partial<AddLocationRequest> = {
  placeName: '',
  latitude: undefined,
  longitude: undefined,
  settings: {
    services: {
      electricity: false,
      weather: false,
      eventTypes: [],
    },
    radius: DEFAULT_LOCATION_RADIUS_KM * METERS_IN_KM,
    notificationsEnable: false,
  },
};

export const LocationForm = ({ initialLocation, submit, isPending }: LocationFormProps) => {
  const [preloadedLocalization, setPreloadedLocalization] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddLocationRequest>({
    defaultValues: { ...(initialLocation ?? defaultLocation), settings: { radius: (initialLocation?.settings.radius ?? DEFAULT_LOCATION_RADIUS_KM) / METERS_IN_KM} },
  });

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
  }, [initialLocation, setValue]);

  const onSubmit = async (request: AddLocationRequest) => {
    submit({
      ...request,
      settings: {
        ...request.settings,
        radius: request.settings.radius * METERS_IN_KM,
      },
    });
  };

  return (
    <PageWrapper>
      <SafeAreaView edges={['left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ gap: 16 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}>
          <CustomSurface style={styles.locationSurface}>
            <Text variant="h3">Nazwa lokalizacji</Text>
            <Text color="secondary">
              Wprowadź nazwę lokalizacji, aby łatwo ją rozpoznać w aplikacji (np. Dom, Praca)
            </Text>
            <Controller
              control={control}
              name="placeName"
              rules={{ required: 'Nazwa lokalizacji jest wymagana', maxLength: 50 }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <CustomTextInput
                  editable={!isPending}
                  value={value}
                  style={{ marginVertical: 4, marginHorizontal: 2 }}
                  placeholder="Podaj nazwę lokalizacji"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={error?.message}
                />
              )}
            />
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h3">Adres</Text>
            <Text color="secondary">
              Wprowadź adres lokalizacji, aby dokładnie określić jej położenie na mapie
            </Text>
            <Controller
              control={control}
              name="latitude"
              render={({ field: { onChange: onLatitudeChange } }) => (
                <Controller
                  control={control}
                  name="longitude"
                  rules={{ required: 'Adres lokalizacji jest wymagany' }}
                  render={({ field: { onChange: onLongitudeChange }, fieldState: { error } }) => (
                    <LocationTextInput
                      editable={!isPending}
                      initialValue={preloadedLocalization || ''}
                      onPlaceSelect={(coordinates) => {
                        onLatitudeChange(coordinates.latitude);
                        onLongitudeChange(coordinates.longitude);
                      }}
                      error={error?.message}
                    />
                  )}
                />
              )}
            />
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h3">Usługi</Text>
            <Text color="secondary">
              Wybierz usługi dla których będziesz otrzymywać powiadomienia w przypadku ich
              planowanego wyłączenia
            </Text>
            <Row style={{ gap: 12, height: 80, marginTop: 24 }}>
              <Controller
                control={control}
                name="settings.services.electricity"
                render={({ field: { value, onChange } }) => (
                  <OutageSelect
                    onPress={() => onChange(!value)}
                    isActive={value}
                    label="Prąd"
                    iconName="flash"
                  />
                )}
              />
              <Controller
                control={control}
                name="settings.services.weather"
                render={({ field: { value, onChange } }) => (
                  <OutageSelect
                    onPress={() => onChange(!value)}
                    isActive={value}
                    label="Pogoda"
                    iconName="weather-partly-cloudy"
                  />
                )}
              />
            </Row>
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h3">Zasięg</Text>
            <Row>
              <Text>{MIN_LOCATION_RADIUS_KM} km</Text>
              <View style={{ flex: 1 }} />
              <Text>{MAX_LOCATION_RADIUS_KM} km</Text>
            </Row>
            <Controller
              control={control}
              name="settings.radius"
              render={({ field: { value, onChange } }) => (
                <>
                  <CustomSlider
                    value={value}
                    onValueChange={onChange}
                    min={MIN_LOCATION_RADIUS_KM}
                    max={MAX_LOCATION_RADIUS_KM}
                    step={1}
                    disabled={isPending}
                  />
                  <Text>
                    <Text weight="bold">Obecny zasięg:</Text> {value} km
                  </Text>
                </>
              )}
            />
          </CustomSurface>

          <CustomSurface style={styles.locationSurface}>
            <Text variant="h3">Powiadomienia</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text variant="body1" align="justify" style={{ flex: 1 }}>
                Otrzymuj powiadomienia push o przerwach w dostawie usług dla tej lokalizacji
              </Text>
              <Controller
                control={control}
                name="settings.notificationsEnable"
                render={({ field: { onChange, value } }) => (
                  <CustomSwitch disabled={isPending} value={value} onValueChange={onChange} />
                )}
              />
            </View>
          </CustomSurface>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending}>
            Zatwierdź lokalizację
          </Button>
        </ScrollView>
      </SafeAreaView>
    </PageWrapper>
  );
};

const OutageSelect = ({
  onPress,
  isActive,
  label,
  iconName,
}: {
  onPress: () => void;
  isActive: boolean;
  label: string;
  iconName: string;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <IconWithTitle iconName={iconName} label={label} iconSize={50} isActive={isActive} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  locationSurface: {
    padding: 16,
  },
});
