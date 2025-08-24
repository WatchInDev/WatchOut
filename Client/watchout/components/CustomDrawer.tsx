import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Drawer } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { Text } from 'components/Base/Text';
import { Map } from './Map';
import { EventTypes } from './EventTypes';

const NavDrawer = createDrawerNavigator();

export const AppNavigator = () => {
  return (
    <NavDrawer.Navigator
      initialRouteName='WatchOut'
      screenOptions={{
        drawerStyle: {
          width: 100,
        }
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <NavDrawer.Screen name="WatchOut" component={Map} options={{ drawerLabel: 'Mapa' }} />
      <NavDrawer.Screen name="EventTypes" component={EventTypes} options={{ drawerLabel: 'Rodzaje zdarzeń' }} />
    </NavDrawer.Navigator>
  );
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  return (
    <View className='flex-1'>
      <View className='p-4 border-b border-gray-200'>
        <Text className='text-lg font-bold'>Watchout</Text>
      </View>
      <DrawerContentScrollView {...props}>
        {props.state.routes.map((route, index) => {
          const isRouteActive = props.state.index === index;
          
          return (
            <Drawer.CollapsedItem
              focusedIcon='inbox'
              key={route.key}
              label={props.descriptors[route.key].options.drawerLabel?.toString() || route.name}
              active={isRouteActive}
              onPress={() => props.navigation.navigate(route.name)}
              style={isRouteActive ? styles.activeDrawerItem : styles.inactiveDrawerItem}
            />
          );
        })}
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  activeDrawerItem: {
    backgroundColor: '#f0f0f0',
  },
  inactiveDrawerItem: {
    backgroundColor: 'transparent',
  },
});