import { CustomSurface } from 'components/Layout/CustomSurface';
import { ViewStyle } from 'react-native';
import { Icon } from 'react-native-paper';

type CustomChipProps = {
  icon: string;
  iconColor: string;
  style: ViewStyle;
  children?: React.ReactNode;
};

export const CustomChip = ({ icon, iconColor, style, children }: CustomChipProps) => {
  return (
    <CustomSurface
      style={[
        {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingBlock: 6,
          paddingInline: 10,
          gap: 4,
        },
        style,
      ]}>
      <Icon source={icon} size={16} color={iconColor} />
      {children}
    </CustomSurface>
  );
};
