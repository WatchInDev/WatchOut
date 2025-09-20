import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Map } from '../Map';
import { EventTypes } from '../EventTypes';
import { CustomDrawerContent } from './CustomDrawerContent';

const NavDrawer = createDrawerNavigator();

const routes = [
  { name: 'WatchOut', component: Map, label: 'Mapa' },
  { name: 'EventTypes', component: EventTypes, label: 'Rodzaje zdarzeń' },
]

export const AppNavigator = () => {
  return (
    <NavDrawer.Navigator
      initialRouteName='WatchOut'
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
          name={route.name}
          component={route.component}
          options={{ drawerLabel: route.label }}
        />
      ))}
    </NavDrawer.Navigator>
  );
};