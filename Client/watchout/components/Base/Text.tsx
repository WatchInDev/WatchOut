import { Text as ReactNativeText, TextStyle, TextProps } from 'react-native';
import { theme, TypographyColor, TypographyVariant } from 'utils/theme';

const convertFontWeightToFontFamily = (fontWeight: string | number | undefined) => {
  switch (fontWeight) {
    case 'black':
    case '900':
    case 900:
      return { fontFamily: 'Poppins_900Black' };
    case 'extrabold':
    case '800':
    case 800:
      return { fontFamily: 'Poppins_800ExtraBold' };
    case 'bold':
    case '700':
    case 700:
      return { fontFamily: 'Poppins_700Bold' };
    case 'semibold':
    case '600':
    case 600:
      return { fontFamily: 'Poppins_600SemiBold' };
    case 'medium':
    case '500':
    case 500:
      return { fontFamily: 'Poppins_500Medium' };
    case 'regular':
    case '400':
    case 400:
      return { fontFamily: 'Poppins_400Regular' };
    case 'light':
    case '300':
    case 300:
      return { fontFamily: 'Poppins_300Light' };
    default:
      return {};
  }
};

type BaseTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: TypographyColor;
};

const defaultStyles: TextStyle = {
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
};

export const Text = ({ variant, style, color, ...rest }: BaseTextProps) => {
  const flattenStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : (style as TextStyle | undefined) || {};

  const mergedStyle = {
    ...(variant ? theme.typography[variant] : theme.typography['body1']),
    ...flattenStyle,
    color: theme.palette.text[color || 'primary'],
  };

  if (mergedStyle && mergedStyle.fontWeight !== undefined) {
    const fontFamilyStyles = convertFontWeightToFontFamily(mergedStyle.fontWeight);
    const { fontWeight, ...restStyle } = mergedStyle;

    const combinedStyles = [defaultStyles, fontFamilyStyles, restStyle];
    return <ReactNativeText {...rest} style={combinedStyles} />;
  }

  return <ReactNativeText {...rest} style={[defaultStyles, mergedStyle]} />;
};
