import { createStackNavigator } from '@react-navigation/stack';
import { Settings } from './Settings';
import { navigationTheme } from 'components/Base/navigationTheme';
import { settingsRoutes } from './settingsRoutes';

const Stack = createStackNavigator();

export const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...navigationTheme,
      }}>
      <Stack.Screen
        name="SettingsMain"
        component={Settings}
        options={{ headerShown: false }}
      />
      {settingsRoutes.map((option) => (
        <Stack.Screen
          key={option.label}
          name={option.link}
          component={option.component}
          options={{ headerTitle: option.label }}
        />
      ))}
    </Stack.Navigator>
  );
};
