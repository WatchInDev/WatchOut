import { CustomSwitch } from 'components/Base/CustomSwitch';
import { Text } from 'components/Base/Text';
import { PageWrapper } from 'components/Common/PageWrapper';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { UserPreferences } from 'utils/types';
import { useNotificationSettings } from './useNotificationSettings';
import { useNotificationSettingsUpdate } from './useNotificationSettingsUpdate';
import { Row } from 'components/Base/Row';

type OptionCategory = 'service' | 'event';
const CATEGORY_GROUPS: { title: string; category: OptionCategory }[] = [
  { title: 'Dostawa usług', category: 'service' },
  { title: 'Zdarzenia', category: 'event' },
];

type OptionEntry = {
  [key in keyof UserPreferences]: {
    code: string;
    label: string;
    category: OptionCategory;
  };
};

const OPTIONS: OptionEntry = {
  notifyOnExternalWarning: {
    code: 'notifyOnExternalWarning',
    label: 'Nowa informacja o przerwie w dostawie usług',
    category: 'service',
  },
  notifyOnComment: {
    code: 'notifyOnComment',
    label: 'Nowy komentarz do zgłoszonego zdarzenia',
    category: 'event',
  },
  notifyOnEvent: {
    code: 'notifyOnEvent',
    label: 'Nowe zdarzenie w pobliżu mojej lokalizacji',
    category: 'event',
  },
};

const initialSettings: UserPreferences = Object.keys(OPTIONS).reduce(
  (acc, key) => ({ ...acc, [key]: false }),
  {} as UserPreferences
);

export const NotificationSettings = () => {
  const { data: preferences } = useNotificationSettings();
  const [settings, setSettings] = useState<UserPreferences>(initialSettings);
  const { mutateAsync: updatePreferencesAsync } = useNotificationSettingsUpdate();

  useEffect(() => {
    if (preferences) {
      setSettings(preferences);
    } 
  }, [preferences]);

  const handleChange = (key: keyof UserPreferences, value: boolean) => {
    const updatedSettings = {...settings, [key]: value};
    setSettings(updatedSettings);
    updatePreferencesAsync(updatedSettings);
  };

  return (
    <PageWrapper>
      <View style={{ gap: 40, flex: 1 }}>
        <Text variant="h3">Wyświetlanie powiadomień</Text>

        {CATEGORY_GROUPS.map((group) => {
          const sectionOptions = Object.entries(OPTIONS)
            .filter(([_, value]) => value.category === group.category)
            .map(([key, value]) => ({
              key,
              label: value.label,
            }));

          return (
            <View key={group.category} style={{ gap: 16 }}>
              <Text variant="h4">{group.title}</Text>
              <View style={{ gap: 12 }}>
                {sectionOptions.map((option) => (
                  <Row
                    key={option.key}
                    style={{ alignItems: 'center', gap: 12 }}>
                    <Text variant="body1" style={{ flex: 1 }}>
                      {option.label}
                    </Text>
                    <CustomSwitch
                      value={settings[option.key as keyof UserPreferences]}
                      onValueChange={(value) =>
                        handleChange(option.key as keyof UserPreferences, value)
                      }
                    />
                  </Row>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </PageWrapper>
  );
};
