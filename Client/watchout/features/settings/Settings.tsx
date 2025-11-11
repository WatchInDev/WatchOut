import { useNavigation } from '@react-navigation/native';
import { Text } from 'components/Base/Text';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';

type SettingsProps = {
  options: { icon: string; label: string; link: string }[];
};

export const Settings = ({ options }: SettingsProps) => {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, padding: 16, gap: 24 }}>
      {options.map((option) => (
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
  );
};
