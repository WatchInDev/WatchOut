import '@expo/metro-runtime';
import { StatusBar } from 'expo-status-bar';
import { GEOCODING_API_KEY } from '@env';

import { PaperProvider } from 'react-native-paper';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AuthProvider } from 'features/auth/authContext';

import { paperTheme } from 'utils/paperTheme';
import Geocoding from 'react-native-geocoding';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/pl';
import { useNotifications } from 'utils/notifications/useNotifications';
import { useEffect } from 'react';
import { useCustomFonts } from 'utils/useCustomFonts';
import { theme } from 'utils/theme';
import { AppNavigator } from 'components/Layout/AppNavigator';
import { SnackbarProvider } from 'utils/useSnackbar';
import Reactotron, { openInEditor } from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevToolsBubble } from 'react-native-react-query-devtools';
import { LoadingScreen } from 'components/Common/LoadingScreen';
import { UserLocationProvider } from 'components/location/UserLocationContext';

Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({ name: 'WatchOut' })
  .use(openInEditor())
  .useReactNative({
    asyncStorage: true,
    networking: {
      ignoreUrls: /symbolicate/,
    },
    editor: true,
    errors: { veto: (stackFrame) => false },
    overlay: false,
  })
  .connect();

const queryClient = new QueryClient();

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale('pl');
dayjs.extend(utc);

export default function App() {
  const { loaded } = useCustomFonts();

  useEffect(() => {
    console.info(
      'Initializing Geocoding with API Key:', GEOCODING_API_KEY != null ?
      GEOCODING_API_KEY.substring(0, 5) + '****' + ' (truncated for security)' : 'GEOCODING_API_KEY is null'
    );
    Geocoding.init(GEOCODING_API_KEY);
  }, []);

  const NotificationsInitializer = () => {
    useNotifications();
    return null;
  };

  if (!loaded) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <QueryClientProvider client={queryClient}>
        <NotificationsInitializer />
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <PaperProvider theme={paperTheme}>
              <SnackbarProvider>
                <BottomSheetModalProvider>
                  <UserLocationProvider>
                    <AuthProvider>
                      <NavigationContainer
                        theme={{
                          ...DefaultTheme,
                          colors: {
                            ...DefaultTheme.colors,
                            background: theme.palette.background.default,
                          },
                        }}>
                        <AppNavigator />
                      </NavigationContainer>
                    </AuthProvider>
                  </UserLocationProvider>
                </BottomSheetModalProvider>
              </SnackbarProvider>
            </PaperProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
        {/* <DevToolsBubble queryClient={queryClient} /> */}
      </QueryClientProvider>
    </>
  );
}
