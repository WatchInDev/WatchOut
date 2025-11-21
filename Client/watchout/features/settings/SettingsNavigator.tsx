import { Text } from 'components/Base/Text';
import { createStackNavigator } from '@react-navigation/stack';
import { Settings } from './Settings';
import { navigationTheme } from 'components/Base/navigationTheme';
import { NotificationSettings } from './notifications/NotificationSettings';

const Stack = createStackNavigator();

export const settingsRoutes = [
  {
    icon: 'account-circle',
    label: 'Konto',
    component: () => <Text>Konto</Text>,
    link: 'AccountSettings',
  },
  {
    icon: 'bell',
    label: 'Powiadomienia',
    component: () => <NotificationSettings />,
    link: 'NotificationSettings',
  },
  {
    icon: 'lock',
    label: 'Prywatność',
    component: () => <Text>Prywatność</Text>,
    link: 'PrivacySettings',
  },
];

export const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
      ...navigationTheme
    }}>
      <Stack.Screen
        name="SettingsMain"
        component={() => <Settings options={settingsRoutes} />}
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
