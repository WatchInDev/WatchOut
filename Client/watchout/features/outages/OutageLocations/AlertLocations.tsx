import { Text } from 'components/Base/Text';
import { ScrollView, View } from 'react-native';
import { PageWrapper } from 'components/Common/PageWrapper';
import { useNavigation } from '@react-navigation/native';
import { FabButton } from 'components/Base/FabButton';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { ActivityIndicator, Icon, IconButton } from 'react-native-paper';
import { theme } from 'utils/theme';
import { Row } from 'components/Base/Row';
import { usePinnedLocations } from 'features/outages/usePinnedLocations';
import { IconWithTitle } from 'components/Common/IconWithTitle';
import { useLocationDelete } from 'features/outages/useLocationDelete';
import { ConfirmationModal } from 'components/Common/ConfirmationModal';
import { useState } from 'react';
import { PinnedLocation } from 'utils/types';
import { useSnackbar } from 'utils/useSnackbar';
import { useQueryClient } from '@tanstack/react-query';

export const AlertLocations = () => {
  const navigation = useNavigation();
  const { data: pinnedLocations, isLoading, refetch } = usePinnedLocations();
  const { mutateAsync: deleteLocationAsync, isPending: isDeletePending } = useLocationDelete();
  const [locationToDelete, setLocationToDelete] = useState<PinnedLocation | null>(null);
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const handleLocationDelete = async (locationId: number) => {
    const apiResponse = await deleteLocationAsync(locationId);
    if (apiResponse.status === 200) {
      showSnackbar({
        message: 'Lokalizacja została usunięta.',
        type: 'info',
      });
      setLocationToDelete(null);
    } else {
      alert('Wystąpił błąd podczas usuwania lokalizacji. Spróbuj ponownie później.');
    }
    refetch();
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['pinnedLocations'] });
  };

  return (
    <PageWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}>
          <Text variant="h3">Śledzone lokalizacje</Text>
          <FabButton onPress={() => navigation.navigate('AddLocation' as never)} iconName="plus" />
        </View>
        {isLoading && <ActivityIndicator size="large" color={theme.palette.primary} />}
        {pinnedLocations?.map((location) => (
          <CustomSurface
            key={location.id}
            style={{
              padding: 12,
              marginBottom: 12,
              gap: 4,
            }}>
            <Row
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 6,
              }}>
              <Text variant="h3" color="secondary">
                {location.placeName.substring(0, 15) +
                  (location.placeName.length > 15 ? '...' : '')}
              </Text>
              <Row style={{ alignItems: 'center', flexShrink: 1 }}>
                <IconButton
                  icon="pencil-outline"
                  size={26}
                  style={{ margin: 0, padding: 0 }}
                  onPress={() =>
                    navigation.navigate({ name: 'EditLocation', params: { location } } as never)
                  }
                />
                <IconButton
                  icon="delete-outline"
                  size={26}
                  style={{ margin: 0, padding: 0 }}
                  onPress={() => setLocationToDelete(location)}
                />
              </Row>
            </Row>

            <Row style={{ gap: 8 }}>
              <IconWithTitle
                iconName={'flash'}
                label={'Prąd'}
                isActive={location.services.electricity}
              />
              <IconWithTitle
                iconName={'weather-partly-cloudy'}
                label={'Pogoda'}
                isActive={location.services.weather}
              />
            </Row>

            <View style={{ gap: 8 }}>
              <Row style={{ alignItems: 'center', gap: 8 }}>
                <Icon source="map-marker" size={24} color={theme.palette.text.secondary} />
                <Text weight="bold" color="secondary" wrap>
                  {location.region}
                  <Text color="secondary">, {location.location}</Text>
                </Text>
              </Row>
              <Row style={{ alignItems: 'center', gap: 8 }}>
                <Icon source="radius-outline" size={24} />
                <Text>
                  <Text weight="bold">Zasięg: </Text>
                  {location.radius / 1000} km
                </Text>
              </Row>
              <Row style={{ alignItems: 'center', gap: 8 }}>
                <Icon source="bell-outline" size={24} />
                <Text>
                  <Text weight="bold">Powiadomienia: </Text>
                  {location.notificationsEnable ? 'Włączone' : 'Wyłączone'}
                </Text>
              </Row>
            </View>
          </CustomSurface>
        ))}
        <ConfirmationModal
          isVisible={locationToDelete !== null}
          content="Czy na pewno chcesz usunąć tę lokalizację?"
          onCancel={() => setLocationToDelete(null)}
          onConfirm={async () => handleLocationDelete(locationToDelete!.id)}
          isLoading={isDeletePending}
        />
      </ScrollView>
    </PageWrapper>
  );
};
