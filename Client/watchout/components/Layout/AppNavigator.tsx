import { SafeAreaView } from 'react-native-safe-area-context';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Icon } from 'react-native-paper';
import { useAuth } from 'features/auth/authContext'; 
import { CustomDrawerContent } from './CustomDrawerContent';
import { EventTypes } from 'features/event-types/EventTypes';
import { Map } from 'features/map/Map';
import LoginScreen from '../../features/auth/LoginScreen';
import SignUpScreen from '../../features/auth/SignUpScreen';

const NavDrawer = createDrawerNavigator();

const routes = [
  {
    name: 'WatchOut',
    component: Map,
    label: 'Mapa',
    icon: 'map',
  },
  {
    name: 'EventTypes',
    component: EventTypes,
    label: 'Rodzaje zdarzeń',
    icon: 'format-list-bulleted',
  },
  {
    name: 'Settings',
    component: Map,
    label: 'Ustawienia',
    icon: 'cog',
  },
];

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return null; 

  if (!user) {
    return (
      <NavDrawer.Navigator
        screenOptions={{ headerShown: false }}
        drawerContent={(props) => <SafeAreaView style={{ flex: 1 }} />}
      >
        <NavDrawer.Screen name="Login" component={LoginScreen} />
        <NavDrawer.Screen name="SignUp" component={SignUpScreen} />
      </NavDrawer.Navigator>
    );
  }

  return (
    <NavDrawer.Navigator
      screenOptions={{
        drawerStyle: {
          maxWidth: 240,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontFamily: 'Poppins_600SemiBold',
          color: '#333',
        },
        drawerLabelStyle: {
          fontFamily: 'Poppins_700Regular',
          fontSize: 16,
          color: '#333',
        },
      }}
      drawerContent={(props) => (
        <SafeAreaView style={{ flex: 1 }}>
          <CustomDrawerContent {...props} />
        </SafeAreaView>
      )}
    >
      {routes.map((route) => (
        <NavDrawer.Screen
          key={route.name}
          name={route.label}
          component={route.component}
          options={{
            drawerLabel: route.label,
            drawerIcon: ({ color, size }) => (
              <Icon source={route.icon} size={24} color={color ?? '#333'} />
            ),
          }}
        />
      ))}
    </NavDrawer.Navigator>
  );
};
