import 'react-native-gesture-handler';
import "@expo/metro-runtime";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import './global.css';
import { MD3Theme, PaperProvider } from 'react-native-paper';
import { Home } from 'components/Home';
import { EventTypes } from 'components/EventTypes';
import { NavigationBar } from 'components/NavigationBar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

const theme: Partial<MD3Theme> = {
  mode: 'exact',
  dark: false
}

export default function App() {
  const [loaded] = useFonts({
    MaterialDesignIcons: require("./assets/fonts/MaterialDesignIcons.ttf"),
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold
  });

  return (
    <>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: true,
                header: (props) => <NavigationBar {...props} />
              }}
            >
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="EventTypes" component={EventTypes} />
            </Stack.Navigator>
            <StatusBar style="light" />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </>
  );
}