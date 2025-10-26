import { TextInput as RNTextInput } from 'react-native';
import { theme } from 'utils/theme';

export const TextInput = (props: React.ComponentProps<typeof RNTextInput>) => {
  return (
    <RNTextInput {...props} style={[props.style, { fontFamily: theme.typography.fontFamily }]} />
  );
};
