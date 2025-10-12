import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawerContent } from './CustomDrawerContent';
import { EventTypes } from 'features/event-types/EventTypes';
import { Map } from 'features/map/Map';


const NavDrawer = createDrawerNavigator();

const routes = [
  { name: 'WatchOut', component: Map, label: 'Mapa' },
  { name: 'EventTypes', component: EventTypes, label: 'Rodzaje zdarzeń' },
]

export const AppNavigator = () => {
  return (
    <NavDrawer.Navigator
        screenOptions={{
          drawerStyle: {
            width: 110,
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
          }
        }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {routes.map((route) => (
        <NavDrawer.Screen
          key={route.name}
          name={route.label}
          component={route.component}
          options={{ drawerLabel: route.label }}
        />
      ))}
    </NavDrawer.Navigator>
  );
};