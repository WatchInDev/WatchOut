import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { View, StyleSheet } from 'react-native';
import { Text } from 'components/Base/Text';
import { Drawer } from 'react-native-paper';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
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
            >Guwno</Drawer.CollapsedItem>
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
    fontFamily: 'Poppins_400Regular',
  },
});