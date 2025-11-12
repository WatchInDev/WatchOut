import { createStackNavigator } from '@react-navigation/stack';
import { Outages } from './Outages';
import { LocationSettings } from './LocationSettings';
import { navigationTheme } from 'components/Base/navigationTheme';

const Stack = createStackNavigator();

const outageRoutes = [
  {
    name: 'OutagesMain',
    component: Outages,
    headerShown: false,
  },
  {
    name: 'LocationSettings',
    component: LocationSettings,
    label: 'Ustawienia lokalizacji',
  },
];

export const OutagesNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationTheme,
      }}>
      {outageRoutes.map((route) => (
        <Stack.Screen
          key={route.name}
          name={route.name}
          component={route.component}
          options={{ headerShown: route.headerShown, title: route.label }}
        />
      ))}
    </Stack.Navigator>
  );
};
