import '@expo/metro-runtime';
import { StatusBar } from 'expo-status-bar';
import { GEOCODING_API_KEY } from '@env';

import { PaperProvider } from 'react-native-paper';
import { Text } from 'components/Base/Text';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './components/Layout/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AuthProvider } from 'features/auth/authContext';

import { paperTheme } from 'utils/paperTheme';
import Geocoding from 'react-native-geocoding';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/pl';
import { useCustomFonts } from 'utils/useCustomFonts';
import { useNotifications } from 'utils/notifications/useNotifications';

const queryClient = new QueryClient();

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale('pl');

Geocoding.init(GEOCODING_API_KEY, {
  language: 'pl',
});

export default function App() {
  const { loaded } = useCustomFonts();

  const NotificationsInitializer = () => {
    useNotifications();
    return null;
  };

  if (!loaded) {
    return (
      <>
        <Text>Loading...</Text>
      </>
    );
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <NotificationsInitializer />
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <PaperProvider theme={paperTheme}>
              <BottomSheetModalProvider>
                <AuthProvider>
                  <NavigationContainer>
                    <AppNavigator />
                    <StatusBar style="light" />
                  </NavigationContainer>
                </AuthProvider>
              </BottomSheetModalProvider>
            </PaperProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </>
  );
}
