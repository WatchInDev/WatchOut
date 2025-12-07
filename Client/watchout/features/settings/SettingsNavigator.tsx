import { Text } from 'components/Base/Text';
import { createStackNavigator } from '@react-navigation/stack';
import { Settings } from './Settings';
import { navigationTheme } from 'components/Base/navigationTheme';
import { NotificationSettings } from './notifications/NotificationSettings';
import { AccountSettings } from './AccountSettings';

const Stack = createStackNavigator();

export const settingsRoutes = [
  {
    icon: 'account-circle',
    label: 'Konto',
    component: AccountSettings,
    link: 'AccountSettings',
  },
  {
    icon: 'bell',
    label: 'Powiadomienia',
    component: NotificationSettings,
    link: 'NotificationSettings',
  },
];

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
