import { useNavigation } from '@react-navigation/native';
import { Text } from 'components/Base/Text';
import { PageWrapper } from 'components/Common/PageWrapper';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { settingsRoutes } from './SettingsNavigator';

type SettingsProps = {
  options: { icon: string; label: string; link: string }[];
};

export const Settings = () => {
  const navigation = useNavigation();

  return (
    <PageWrapper>
      <View style={{ flex: 1, gap: 24 }}>
        {settingsRoutes.map((option) => (
          <TouchableOpacity
            key={option.label}
            onPress={() => navigation.navigate(option.link as never)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon source={option.icon} size={24} />
            <Text variant="body1" style={{ flex: 1 }}>
              {option.label}
            </Text>
            <Icon source="chevron-right" size={24} />
          </TouchableOpacity>
        ))}
      </View>
    </PageWrapper>
  );
};
