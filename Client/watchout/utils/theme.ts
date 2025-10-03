import { configureFonts, MD3LightTheme, MD3Theme, MD3TypescaleKey } from "react-native-paper";
import { MD3Type } from "react-native-paper/lib/typescript/types";

const fontConfig: Partial<Record<MD3TypescaleKey, Partial<MD3Type>>> = {
  displayLarge: { fontFamily: 'Poppins_400Regular' },
  displayMedium: { fontFamily: 'Poppins_400Regular' },
  displaySmall: { fontFamily: 'Poppins_400Regular' },
  headlineLarge: {
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500' as '500',
    letterSpacing: 0.25,
    lineHeight: 16,
    fontSize: 16,
  },
  headlineMedium: {
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500' as '500',
    letterSpacing: 0.25,
    lineHeight: 16,
  },
  headlineSmall: {
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500' as '500',
    letterSpacing: 0.25,
    lineHeight: 16,
    fontSize: 12,
  },
  titleLarge: {
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500' as '500',
    letterSpacing: 0.25,
    lineHeight: 16,
    fontSize: 12,
  },
  titleMedium: {
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500' as '500',
    letterSpacing: 0.25,
    lineHeight: 16,
    fontSize: 12,
  },
  titleSmall: {
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500' as '500',
    letterSpacing: 0.25,
    lineHeight: 16,
    fontSize: 12,
  },
  labelLarge: { fontFamily: 'Poppins_500Medium' },
  labelMedium: {
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500' as '500',
    letterSpacing: 0.25,
    lineHeight: 16,
    fontSize: 12,
  },
  labelSmall: { fontFamily: 'Poppins_400Regular' },
  bodyLarge: { fontFamily: 'Poppins_400Regular' },
  bodyMedium: { fontFamily: 'Poppins_400Regular' },
  bodySmall: { fontFamily: 'Poppins_400Regular' },
};

export const theme: Partial<MD3Theme> = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
}