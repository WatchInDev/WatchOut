import { CustomSwitch } from 'components/Base/CustomSwitch';
import { Text } from 'components/Base/Text';
import { useState } from 'react';
import { View } from 'react-native';

type OptionCategory = 'service' | 'event';
const CATEGORY_GROUPS: { title: string; category: OptionCategory }[] = [
  { title: 'Dostawa usług', category: 'service' },
  { title: 'Zdarzenia', category: 'event' },
];

const OPTIONS = {
  onAlertCreated: {
    label: 'Nowa informacja o przerwie w dostawie usług',
    category: 'service',
  },
  onAlertStarted: {
    label: 'Rozpoczęcie planowanej przerwy w dostawie usług',
    category: 'service',
  },
  onAlertEnded: {
    label: 'Zakończenie się przerwy w dostawie usług',
    category: 'service',
  },
  onNewCommentCreated: {
    label: 'Nowy komentarz do zgłoszonego zdarzenia',
    category: 'event',
  },
  onEventNearbyCreated: {
    label: 'Nowe zdarzenie w pobliżu mojej lokalizacji',
    category: 'event',
  },
};

type NotificationForm = Record<keyof typeof OPTIONS, boolean>;

const initialSettings: NotificationForm = Object.keys(OPTIONS).reduce(
  (acc, key) => ({ ...acc, [key]: false }),
  {} as NotificationForm
);

export const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationForm>(initialSettings);

  const handleChange = (key: keyof NotificationForm, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <View style={{ gap: 40, padding: 16, flex: 1 }}>
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
                <View
                  key={option.key}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text variant="body1" style={{ flex: 1 }}>
                    {option.label}
                  </Text>
                  <CustomSwitch
                    value={settings[option.key as keyof NotificationForm]}
                    onValueChange={(value) =>
                      handleChange(option.key as keyof NotificationForm, value)
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};
