import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawerContent } from './CustomDrawerContent';
import { EventTypes } from 'features/event-types/EventTypes';
import { Map } from 'features/map/Map';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SettingsPage } from 'features/settings/SettingsPage';

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
    icon: 'format-list-bulleted'
  },
  {
    name: 'Settings',
    component: SettingsPage,
    label: 'Ustawienia',
    icon: 'cog',
  },
];

export const AppNavigator = () => {
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
      )}>
      {routes.map((route) => (
        <NavDrawer.Screen
          key={route.name}
          name={route.label}
          component={route.component}
          options={{
            drawerLabel: route.label,
            drawerIcon: () => {
              return <Icon source={route.icon} size={24} color="#333" />;
            },
          }}
        />
      ))}
    </NavDrawer.Navigator>
  );
};
