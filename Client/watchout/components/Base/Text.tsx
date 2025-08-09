import { Text as ReactNativeText, TextProps } from 'react-native';

const defaultStyles = {
  fontFamily: 'Roboto_400Regular',
  color: '#4A4459',
};

export const Text: React.FC<TextProps> = (props) => (
  <ReactNativeText {...props} style={[defaultStyles, props.style]} />
);