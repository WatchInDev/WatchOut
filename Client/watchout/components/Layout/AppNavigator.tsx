import { SafeAreaView } from 'react-native-safe-area-context';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Icon } from 'react-native-paper';
import { useAuth } from 'features/auth/authContext'; 
import { CustomDrawerContent } from './CustomDrawerContent';
import { EventTypes } from 'features/event-types/EventTypes';
import { Map } from 'features/map/Map';
import LoginScreen from '../../features/auth/LoginScreen';
import SignUpScreen from '../../features/auth/SignUpScreen';
import { theme } from 'utils/theme';
import { Outages } from 'features/outages/Outages';
import { SettingsNavigator, settingsRoutes } from 'features/settings/SettingsNavigator';
import { getFocusedRouteNameFromRoute, RouteProp } from '@react-navigation/native';
import { navigationTheme } from 'components/Base/navigationTheme';

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
    name: 'Alerts',
    component: Outages,
    label: 'Awarie',
    icon: 'alert-circle-outline',
  },
  {
    name: 'Settings',
    component: SettingsNavigator,
    label: 'Ustawienia',
    icon: 'cog',
    headerShown: (route: RouteProp<any, any>) => {
      const focusedRoute = getFocusedRouteNameFromRoute(route);
      return !focusedRoute || focusedRoute === "SettingsMain"
    },
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
        ...navigationTheme,
        drawerStyle: {
          maxWidth: 240,
        },
        drawerLabelStyle: {
          fontFamily: 'Poppins_700Regular',
          fontSize: 16,
          color: theme.palette.text.primary,
        },
      }}
      drawerContent={(props) => (
        <SafeAreaView style={{ flex: 1 }}>
          <CustomDrawerContent {...props} />
        </SafeAreaView>
      )}>
      {routes.map((routeDef) => (
        <NavDrawer.Screen
          key={routeDef.name}
          name={routeDef.label}
          component={routeDef.component}
          options={({ route }) => {
            return {
              drawerLabel: routeDef.label,
              drawerIcon: () => {
                return <Icon source={routeDef.icon} size={24} color={theme.palette.text.primary} />;
              },
              headerShown: routeDef.headerShown?.(route) ?? true,
            };
          }}
        />
      ))}
    </NavDrawer.Navigator>
  );
};
