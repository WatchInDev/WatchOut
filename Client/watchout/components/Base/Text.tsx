import { Text as ReactNativeText, TextProps } from 'react-native';

const defaultStyles = {
  color: '#4A4459',
};

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

export const Text: React.FC<TextProps> = (props) => {
  if (props?.style?.fontWeight !== undefined) {
    const fontFamilyStyles = convertFontWeightToFontFamily(props.style.fontWeight);
    const { fontWeight, ...restStyle } = props.style || {};

    const combinedStyles = [defaultStyles, fontFamilyStyles, restStyle];
    return <ReactNativeText {...props} style={combinedStyles} />;
  }

  return (
    <ReactNativeText
      {...props}
      style={[defaultStyles, props.style, { fontFamily: 'Poppins_400Regular' }]}
    />
  );
};
