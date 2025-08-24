import 'react-native-gesture-handler';
import "@expo/metro-runtime";
import { StatusBar } from 'expo-status-bar';

import './global.css';
import { MD3Theme, PaperProvider } from 'react-native-paper';
import { Text } from 'components/Base/Text';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from 'components/CustomDrawer';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

const theme: Partial<MD3Theme> = {
  mode: 'exact',
  dark: false
}

const queryClient = new QueryClient();

export default function App() {
  const [loaded] = useFonts({
    MaterialDesignIcons: require("./assets/fonts/MaterialDesignIcons.ttf"),
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold
  });

  if (!loaded) {
    return <>
      <Text>Loading...</Text>
    </>
  }

  return (
    <>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
              <PaperProvider theme={theme}>
                <NavigationContainer>
                  <AppNavigator />
                  <StatusBar style="light" />
                </NavigationContainer>
              </PaperProvider>
            </SafeAreaProvider>
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}