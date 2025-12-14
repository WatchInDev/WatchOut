import { View, ViewStyle } from 'react-native';
import { Icon } from 'react-native-paper';
import { Text } from 'components/Base/Text';
import { theme } from 'utils/theme';
import { icons } from 'components/Base/icons';

type IconWithTitleProps = {
  iconName: string;
  iconSize?: number;
  label: string;
  isActive?: boolean;
  fontSize?: number;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
};

export const IconWithTitle = ({
  iconName,
  iconSize = 28,
  label,
  isActive = true,
  fontSize = 14,
  style,
  iconStyle,
}: IconWithTitleProps) => {
  return (
    <View
      style={[
        {
          backgroundColor: isActive ? theme.palette.primary : theme.palette.tertiary,
          aspectRatio: 1,
          padding: 8,
          opacity: isActive ? 1 : 0.4,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: isActive ? theme.palette.primary : theme.palette.text.tertiary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}>
      <View style={iconStyle}>
        <Icon
          source={icons[iconName as keyof typeof icons] ?? iconName}
          size={iconSize}
          color={isActive ? theme.palette.text.primaryInverse : theme.palette.text.secondary}
        />
      </View>
      <Text
        color={isActive ? 'primaryInverse' : 'secondary'}
        variant="body2"
        align="center"
        style={{ fontSize: fontSize }}>
        {label}
      </Text>
    </View>
  );
};
