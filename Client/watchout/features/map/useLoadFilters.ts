import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { FILTERS_STORAGE_KEY } from 'utils/constants';

export const useLoadFilters = (callback: (value: string | null) => void) => {
  const { getItem } = useAsyncStorage(FILTERS_STORAGE_KEY);
  
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const storedFilters = await getItem();
        if (storedFilters) {
          callback(storedFilters);
        }
      } catch (e) {
        console.error('Failed to load filters from storage', e);
      }
    };

    loadFilters();
  }, [callback, getItem]);
};
