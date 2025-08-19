import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Drawer } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { Text } from 'components/Base/Text';
import { Home } from './Home';
import { EventTypes } from './EventTypes';

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
              label={route.name}
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

const NavDrawer = createDrawerNavigator();

export const AppNavigator = () => {
  return (
    <NavDrawer.Navigator
      initialRouteName='Home'
      screenOptions={{
        drawerStyle: {
          width: 100,
        }
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <NavDrawer.Screen name="Home" component={Home} />
      <NavDrawer.Screen name="EventTypes" component={EventTypes} />
    </NavDrawer.Navigator>
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