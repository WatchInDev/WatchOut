import { createStackNavigator } from '@react-navigation/stack';
import { Outages } from './Outages';
import { OutageLocations } from './OutageLocations/OutageLocations';
import { navigationTheme } from 'components/Base/navigationTheme';
import { AddLocation } from './OutageLocations/AddLocation/AddLocation';

const Stack = createStackNavigator();

const outageRoutes = [
  {
    name: 'OutagesMain',
    component: Outages,
    headerShown: false,
  },
  {
    name: 'LocationSettings',
    component: OutageLocations,
    label: 'Ustawienia lokalizacji',
  },
  {
    name: 'AddLocation',
    component: AddLocation,
    label: 'Dodawanie lokalizacji',
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
