import { Platform, Text as ReactNativeText, TextProps } from 'react-native';

const defaultStyles = {
  color: '#4A4459',
};

const convertFontWeightToFontFamily = (fontWeight: string | number | undefined) => {
  switch (fontWeight) {
    case 'black':
    case 900:
      return { fontFamily: 'Poppins_900Black' };
    case 'extrabold':
    case 800:
      return { fontFamily: 'Poppins_800ExtraBold' };
    case 'bold':
    case 700:
      return { fontFamily: 'Poppins_700Bold' };
    case 'semibold':
    case 600:
      return { fontFamily: 'Poppins_600SemiBold' };
    case 'medium':
    case 500:
      return { fontFamily: 'Poppins_500Medium' };
    case 'regular':
    case 400:
      return { fontFamily: 'Poppins_400Regular' };
    case 'light':
    case 300:
      return { fontFamily: 'Poppins_300Light' };
    default:
      return {};
  }
}

export const Text: React.FC<TextProps> = (props) => {  
  if (props.className?.includes('font-') || props.style?.fontWeight) {
    const fontWeightMatch = props.className?.match(/font-([a-z]+)/);

    if (fontWeightMatch || props.style?.fontWeight) {
      const resolvedFontWeight = fontWeightMatch ? fontWeightMatch[1] : props.style?.fontWeight;
      const fontFamilyStyles = convertFontWeightToFontFamily(resolvedFontWeight);
      const { fontWeight, ...restStyle } = props.style || {};

      const combinedStyles = [defaultStyles, fontFamilyStyles, restStyle];
      return (
        <ReactNativeText {...props} className={props.className?.replace(/font-[a-z]+/, '').trim()} style={combinedStyles} />
      );
    }
  }

  return (
    <ReactNativeText {...props} style={[defaultStyles, props.style, { fontFamily: 'Poppins_400Regular' }]} />
  );
};