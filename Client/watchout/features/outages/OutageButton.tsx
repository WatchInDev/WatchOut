import { View } from 'react-native';
import { Icon } from 'react-native-paper';
import { Text } from 'components/Base/Text';
import { theme } from 'utils/theme';

type OutageButtonProps = {
  iconName: string;
  iconSize?: number;
  label: string;
  isActive?: boolean;
};

export const OutageButton = ({
  iconName,
  iconSize = 28,
  label,
  isActive = true,
}: OutageButtonProps) => {
  return (
    <View
      style={{
        backgroundColor: isActive ? theme.palette.primary : theme.palette.tertiary,
        aspectRatio: 1,
        padding: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Icon
        source={iconName}
        size={iconSize}
        color={isActive ? theme.palette.text.primaryInverse : theme.palette.text.secondary}
      />
      <Text color={isActive ? 'primaryInverse' : 'secondary'} variant="body2">
        {label}
      </Text>
    </View>
  );
};
