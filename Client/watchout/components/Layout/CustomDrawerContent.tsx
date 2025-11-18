import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, StyleSheet, Button } from 'react-native';
import { Text } from 'components/Base/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from 'features/auth/authContext';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();

    props.navigation.closeDrawer();

  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Watchout</Text>
      </View>
      <DrawerContentScrollView {...props}>
        {props.state.routes.map((route, index) => {
          const isRouteActive = props.state.index === index;

          const icon = props.descriptors[route.key].options.drawerIcon;
          return (
            <DrawerItem
              icon={icon}
              key={route.key}
              label={() => (
                <Text>
                  {props.descriptors[route.key].options.drawerLabel?.toString() || route.name}
                </Text>
              )}
              onPress={() => props.navigation.navigate(route.name)}
              style={isRouteActive ? styles.activeDrawerItem : styles.inactiveDrawerItem}
            />
          );
        })}
      </DrawerContentScrollView>
      <View style={styles.logoutContainer}>
        <Button title="Wyloguj" onPress={handleLogout} color="#d9534f" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  logoutContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'transparent',
  },
});
