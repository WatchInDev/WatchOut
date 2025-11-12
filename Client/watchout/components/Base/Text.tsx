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

type Align = 'auto' | 'left' | 'right' | 'center' | 'justify';

const alignToStyle = (align: Align | undefined) => {
  switch (align) {
    case 'left':
      return { textAlign: 'left' as const };
    case 'right':
      return { textAlign: 'right' as const };
    case 'center':
      return { textAlign: 'center' as const };
    case 'justify':
      return { textAlign: 'justify' as const };
    default:
      return {};
  }
};

type BaseTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: TypographyColor;
  weight?: 'bold' | 'light';
  align?: Align;
  wrap?: boolean;
};

const defaultStyles: TextStyle = {
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
};

export const Text = ({ variant, style, color, weight, align, wrap, ...rest }: BaseTextProps) => {
  const flattenStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : (style as TextStyle | undefined) || {};

  if (weight) {
    flattenStyle.fontWeight = weight === 'bold' ? '700' : '300';
  }

  const mergedStyle = {
    ...(variant ? theme.typography[variant] : theme.typography['body1']),
    color:
      color && Object.prototype.hasOwnProperty.call(theme.palette.text, color)
        ? theme.palette.text[color as keyof typeof theme.palette.text]
        : theme.palette.text.primary,
    ...(wrap ? { flexWrap: 'wrap', flexShrink: 1 } : {}),
    ...flattenStyle,
  };

  if (mergedStyle && mergedStyle.fontWeight !== undefined) {
    const fontFamilyStyles = convertFontWeightToFontFamily(mergedStyle.fontWeight);
    const { fontWeight, ...restStyle } = mergedStyle;

    const combinedStyles = [defaultStyles, fontFamilyStyles, restStyle, alignToStyle(align)];
    return <ReactNativeText {...rest} style={combinedStyles} />;
  }

  return <ReactNativeText {...rest} style={[defaultStyles, mergedStyle, alignToStyle(align)]} />;
};
