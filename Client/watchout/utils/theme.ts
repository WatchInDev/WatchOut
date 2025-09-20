import { configureFonts, MD3Theme, MD3TypescaleKey } from "react-native-paper";
import { MD3Type } from "react-native-paper/lib/typescript/types";

const fontConfig: Partial<Record<MD3TypescaleKey, Partial<MD3Type>>> = {
  labelMedium: {
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500' as '500',
    letterSpacing: 0.25,
    lineHeight: 16,
    fontSize: 12,
  }
};

export const theme: Partial<MD3Theme> = {
  mode: 'exact',
  dark: false,
  fonts: configureFonts({ config: fontConfig })
}