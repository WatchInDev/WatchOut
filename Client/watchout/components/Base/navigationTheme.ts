import { StyleProp, TextStyle } from "react-native";
import { theme } from "utils/theme";

type NavigationTheme = {
  backgroundColor: string;
  headerTitleStyle: StyleProp<TextStyle>;
};

export const navigationTheme: NavigationTheme = {
  backgroundColor: theme.palette.background.default,
  headerTitleStyle: {
    fontSize: 18,
    fontFamily: 'Poppins_500Medium',
    color: theme.palette.text.primary,
    lineHeight: 24,
  }
};
