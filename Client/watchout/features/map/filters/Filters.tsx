import { Text } from 'components/Base/Text';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { CustomSlider } from 'components/Base/CustomSlider';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { ActivityIndicator, Button, IconButton } from 'react-native-paper';
import { useGetEventTypes } from 'features/event-types/useGetEventTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PageWrapper } from 'components/Common/PageWrapper';
import { DEFAULT_REPORT_HOURS_FILTER, FILTERS_STORAGE_KEY } from 'utils/constants';
import { EventFilters } from 'utils/types';
import { EventTypeButton } from './EventTypeButton';
import { useSnackbar } from 'utils/useSnackbar';
import { Row } from 'components/Base/Row';

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

  const resetFiltersToDefault = () => {
    if (eventTypes) {
      setLocalFilters({
        hoursSinceReport: DEFAULT_REPORT_HOURS_FILTER,
        eventTypesIds: eventTypes?.map((type) => type.id) || [],
      });
      showSnackbar({ message: 'Filtry zostały zresetowane', type: 'info' });
    }
  };

  useEffect(() => {
    const filtersChanged =
      localFilters.hoursSinceReport !== filters.hoursSinceReport ||
      localFilters.eventTypesIds.length !== filters.eventTypesIds.length ||
      !localFilters.eventTypesIds.every((id, idx) => id === filters.eventTypesIds[idx]);

    if (!filtersChanged) return;

    const timer = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(localFilters));
        showSnackbar({ message: 'Filtry zostały zapisane', type: 'success' });
        setFilters(localFilters);
      } catch (error) {
        console.error('Failed to save filters to storage', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [localFilters, filters, setFilters, showSnackbar]);

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
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h2">Filtrowanie zdarzeń</Text>
            <IconButton
              icon="restore"
              size={24}
              onPress={resetFiltersToDefault}
              style={{ position: 'absolute', right: 0 }}
            />
          </Row>

          <CustomSurface style={{ padding: 16, marginTop: 16 }}>
            <Text variant="h6">Czas od zgłoszenia</Text>
            <CustomSlider
              value={localFilters.hoursSinceReport}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({ ...prev, hoursSinceReport: value }))
              }
              labels={{ minLabel: '1 godz.', maxLabel: '72 godz.' }}
              min={1}
              max={72}
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
                <View key={type.id} style={{ width: '30%' }}>
                  <EventTypeButton
                    isActive={localFilters.eventTypesIds.includes(type.id)}
                    setFilters={setLocalFilters}
                    type={type}
                  />
                </View>
              ))}
            </View>
          </CustomSurface>
        </PageWrapper>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
