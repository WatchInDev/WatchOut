import { createStackNavigator } from '@react-navigation/stack';
import { Alerts } from './Alerts';
import { AlertLocations } from './OutageLocations/AlertLocations';
import { navigationTheme } from 'components/Base/navigationTheme';
import { LocationForm } from './OutageLocations/LocationForm/LocationForm';
import { AddLocation } from './OutageLocations/LocationForm/AddLocation';
import { EditLocation } from './OutageLocations/LocationForm/EditLocation';

const Stack = createStackNavigator();

const outageRoutes = [
  {
    name: 'OutagesMain',
    component: Alerts,
    headerShown: false,
  },
  {
    name: 'LocationSettings',
    component: AlertLocations,
    label: 'Ustawienia lokalizacji',
  },
  {
    name: 'AddLocation',
    component: AddLocation,
    label: 'Dodawanie lokalizacji',
  },
  {
    name: 'EditLocation',
    component: EditLocation,
    label: 'Edycja lokalizacji',
  },
];

export const AlertsNavigator = () => {
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
