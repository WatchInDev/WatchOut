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
import { OutageButton } from 'features/outages/OutageButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationDelete } from 'features/outages/useLocationDelete';
import { ConfirmationModal } from 'components/Common/ConfirmationModal';
import { useState } from 'react';
import { PinnedLocation } from 'utils/types';
import { useSnackbar } from 'utils/useSnackbar';

export const OutageLocations = () => {
  const navigation = useNavigation();
  const { data: pinnedLocations, isLoading, refetch } = usePinnedLocations();
  const { mutateAsync: deleteLocationAsync, isPending: isDeletePending } = useLocationDelete();
  const [locationToDelete, setLocationToDelete] = useState<PinnedLocation | null>(null);
  const { showSnackbar } = useSnackbar();

  const handleLocationDelete = async (locationId: number) => {
    showSnackbar('Usuwanie lokalizacji...', { label: 'OK', onPress: () => {} });
    return;
    const apiResponse = await deleteLocationAsync(locationId);
    if (apiResponse.status === 200) {
      setLocationToDelete(null);
    } else {
      alert('Wystąpił błąd podczas usuwania lokalizacji. Spróbuj ponownie później.');
    }
    refetch();
  };

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
        <FabButton onPress={() => navigation.navigate('AddLocation' as never)} iconName="plus" />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['bottom', 'left', 'right']}>
          {isLoading && <ActivityIndicator size="large" color={theme.palette.primary} />}
          {pinnedLocations?.map((location) => (
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
                <Text variant="h3" color="secondary">
                  {location.placeName}
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
                    onPress={() => setLocationToDelete(location)}
                  />
                </Row>
              </View>
              <Row style={{ alignItems: 'center', gap: 4 }}>
                <Icon source="map-marker" size={32} color={theme.palette.text.secondary} />
                <Text weight="bold" variant="h6" color="secondary" wrap>
                  {location.region}
                  <Text variant="h6" color="secondary">
                    , {location.location}
                  </Text>
                </Text>
              </Row>
              <Row style={{ gap: 8 }}>
                <OutageButton iconName={'flash'} label={'Prąd'} />
                <OutageButton iconName={'water-off'} label={'Woda'} />
                <OutageButton iconName={'fire'} label={'Gaz'} isActive={false} />
                <OutageButton iconName={'wifi'} label={'Sieć'} />
              </Row>
              <View style={{ gap: 8 }}>
                <Row style={{ alignItems: 'center', gap: 8 }}>
                  <Icon source="radius-outline" size={24} />
                  <Text>
                    <Text weight="bold">Zasięg: </Text>
                    {15 /*MOCKED*/} km
                  </Text>
                </Row>
                <Row style={{ alignItems: 'center', gap: 8 }}>
                  <Icon source="bell-outline" size={24} />
                  <Text>
                    <Text weight="bold">Powiadomienia: </Text>
                    {'Włączone' /*MOCKED*/}
                  </Text>
                </Row>
              </View>
            </CustomSurface>
          ))}
        </SafeAreaView>
        <ConfirmationModal
          isVisible={locationToDelete !== null}
          message="Czy na pewno chcesz usunąć tę lokalizację?"
          onCancel={() => setLocationToDelete(null)}
          onConfirm={async () => handleLocationDelete(locationToDelete!.id)}
          isLoading={isDeletePending}
        />
      </ScrollView>
    </PageWrapper>
  );
};
