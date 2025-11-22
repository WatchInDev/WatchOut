import { Text } from 'components/Base/Text';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { CustomSlider } from 'components/Base/CustomSlider';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useGetEventTypes } from 'features/events/event-types.hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PageWrapper } from 'components/Common/PageWrapper';
import { FILTERS_STORAGE_KEY } from 'utils/constants';
import { EventFilters } from 'utils/types';
import { EventTypeButton } from './EventTypeButton';
import { useSnackbar } from 'utils/useSnackbar';

type FiltersProps = {
  isVisible: boolean;
  onClose?: () => void;
  filters: EventFilters;
  setFilters: React.Dispatch<React.SetStateAction<EventFilters>>;
};

export const Filters = ({ isVisible, onClose, filters, setFilters }: FiltersProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { data: eventTypes, isLoading: isEventTypesLoading } = useGetEventTypes();
  const { showSnackbar } = useSnackbar();

  const [localFilters, setLocalFilters] = useState<EventFilters>(filters);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const storedFilters = await AsyncStorage.getItem(FILTERS_STORAGE_KEY);
        if (storedFilters) {
          setFilters(JSON.parse(storedFilters));
        }
      } catch (error) {
        console.error('Failed to load filters from storage:', error);
      }
    };

    loadFilters();
  }, [setFilters]);

  const handleApplyFilters = async () => {
    try {
      console.log('Saving filters preference to storage');
      await AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(localFilters));
      setFilters(localFilters);
      showSnackbar({ message: 'Filtry zostały zastosowane', type: 'success' });
    } catch (error) {
      console.error('Failed to save filters to storage:', error);
    }
    onClose?.();
  };

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['50%', '80%']}
      enablePanDownToClose
      onClose={onClose}>
      <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 128 }}>
        <PageWrapper>
          <Text variant="h2">Filtrowanie zdarzeń</Text>

          <CustomSurface style={{ padding: 16, marginTop: 16 }}>
            <Text variant="h6">Czas od zgłoszenia</Text>
            <CustomSlider
              value={localFilters.hoursSinceReport}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, hoursSinceReport: value }))
              }
              labels={{ minLabel: '0 godz.', maxLabel: '24 godz.' }}
              min={0}
              max={24}
              step={1}
            />
            <Text>{localFilters.hoursSinceReport} godz.</Text>
          </CustomSurface>

          <CustomSurface style={{ padding: 16, marginTop: 16 }}>
            <Text variant="h6">Rodzaje zdarzeń</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                marginTop: 12,
              }}>
              {isEventTypesLoading && <ActivityIndicator />}
              {eventTypes?.map((type) => (
                <EventTypeButton
                  key={type.id}
                  isActive={localFilters.eventTypesIds.includes(type.id)}
                  setFilters={setLocalFilters}
                  type={type}
                />
              ))}
            </View>
          </CustomSurface>

          <Button
            mode="contained"
            onPress={async () => await handleApplyFilters()}
            style={{ marginTop: 24 }}
            icon={'filter-variant'}>
            Zastosuj filtry
          </Button>
        </PageWrapper>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
