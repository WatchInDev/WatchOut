import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { View, StyleSheet } from 'react-native';
import { Text } from 'components/Base/Text';
import { Drawer } from 'react-native-paper';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Watchout</Text>
      </View>
      <DrawerContentScrollView {...props}>
        {props.state.routes.map((route, index) => {
          const isRouteActive = props.state.index === index;

          return (
            <Drawer.CollapsedItem
              focusedIcon="inbox"
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
  container: {
    flex: 1,
  },
  header: {
    marginTop: 12,
    textAlign: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  activeDrawerItem: {
    backgroundColor: '#f0f0f0',
  },
  inactiveDrawerItem: {
    backgroundColor: 'transparent',
  },
});
