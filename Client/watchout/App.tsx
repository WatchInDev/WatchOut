import 'react-native-gesture-handler';
import "@expo/metro-runtime";
import { StatusBar } from 'expo-status-bar';

import './global.css';
import { MD3Theme, PaperProvider, configureFonts } from 'react-native-paper';
import { Text } from 'components/Base/Text';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './components/Layout/AppNavigator';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from '@expo-google-fonts/poppins/useFonts';
import { Poppins_100Thin } from '@expo-google-fonts/poppins/100Thin';
import { Poppins_100Thin_Italic } from '@expo-google-fonts/poppins/100Thin_Italic';
import { Poppins_200ExtraLight } from '@expo-google-fonts/poppins/200ExtraLight';
import { Poppins_200ExtraLight_Italic } from '@expo-google-fonts/poppins/200ExtraLight_Italic';
import { Poppins_300Light } from '@expo-google-fonts/poppins/300Light';
import { Poppins_300Light_Italic } from '@expo-google-fonts/poppins/300Light_Italic';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_400Regular_Italic } from '@expo-google-fonts/poppins/400Regular_Italic';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_500Medium_Italic } from '@expo-google-fonts/poppins/500Medium_Italic';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_600SemiBold_Italic } from '@expo-google-fonts/poppins/600SemiBold_Italic';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Poppins_700Bold_Italic } from '@expo-google-fonts/poppins/700Bold_Italic';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins/800ExtraBold';
import { Poppins_800ExtraBold_Italic } from '@expo-google-fonts/poppins/800ExtraBold_Italic';
import { Poppins_900Black } from '@expo-google-fonts/poppins/900Black';
import { Poppins_900Black_Italic } from '@expo-google-fonts/poppins/900Black_Italic';


const fontConfig = {
  default: {
    fontFamily: 'Poppins_400Regular',
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  labelMedium: {
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500',
    letterSpacing: 0.25,
    lineHeight: 16,
    fontSize: 12,
  }
};

const theme: Partial<MD3Theme> = {
  mode: 'exact',
  dark: false,
  fonts: configureFonts({ config: fontConfig })
}

const queryClient = new QueryClient();

export default function App() {
  const [loaded] = useFonts({
    MaterialDesignIcons: require("./assets/fonts/MaterialDesignIcons.ttf"),
      Poppins_100Thin, 
      Poppins_100Thin_Italic, 
      Poppins_200ExtraLight, 
      Poppins_200ExtraLight_Italic, 
      Poppins_300Light, 
      Poppins_300Light_Italic, 
      Poppins_400Regular, 
      Poppins_400Regular_Italic, 
      Poppins_500Medium, 
      Poppins_500Medium_Italic, 
      Poppins_600SemiBold, 
      Poppins_600SemiBold_Italic, 
      Poppins_700Bold, 
      Poppins_700Bold_Italic, 
      Poppins_800ExtraBold, 
      Poppins_800ExtraBold_Italic, 
      Poppins_900Black, 
      Poppins_900Black_Italic
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