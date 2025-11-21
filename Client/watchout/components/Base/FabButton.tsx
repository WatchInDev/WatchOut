import { TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-paper";
import { theme, TypographyColor } from "utils/theme";

type FabButtonProps = {
  onPress: () => void;
  size?: number;
  iconName: string;
  iconColor?: TypographyColor;
};

export const FabButton = ({ onPress, iconName, iconColor, size = 64 }: FabButtonProps) => {

  return <TouchableOpacity
    onPress={onPress}
    style={{
      width: size,
      height: size,
      borderRadius: size / 5,
      backgroundColor: theme.palette.primary,
    }}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Icon source={iconName} size={40} color={iconColor ?? theme.palette.background.default} />
    </View>
  </TouchableOpacity>;
}