import { useRef, useState } from 'react';
import { TextInput as RNTextInput, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { theme } from 'utils/theme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Text } from './Text';

type CustomTextInputProps = React.ComponentProps<typeof RNTextInput> & {
  label?: string;
  startIcon?: string;
  endIcon?: string;
};

export const CustomTextInput = ({ label, startIcon, endIcon, ...props }: CustomTextInputProps) => {
  const inputRef = useRef<RNTextInput>(null);
  const focusProgress = useSharedValue(0);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState(props.value ?? '');

  const animatedStyle = useAnimatedStyle(() => {
    return {
      outlineWidth: focusProgress.value === 1 ? 1.5 : 1,
      outlineColor: focusProgress.value === 1 ? theme.palette.primary : theme.palette.text.tertiary,
      borderRadius: 6,
      paddingHorizontal: 8,
      flexDirection: 'row',
      backgroundColor: theme.palette.background.default,
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 250 });
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 250 });
    props.onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    setValue(text);
    props.onChangeText?.(text);
  };

  return (
    <Animated.View style={[animatedStyle, props.style]}>
      {label && (
        <Text
          style={{
            position: 'absolute',
            top: -10,
            left: startIcon ? 32 : 12,
            fontSize: 12,
            backgroundColor: theme.palette.background.default,
            paddingHorizontal: 4,
            color: isFocused ? theme.palette.primary : theme.palette.text.secondary,
          }}>
          {label}
        </Text>
      )}
      {startIcon && (
        <View style={{ marginRight: 8 }}>
          <Icon source={startIcon} size={24} color={theme.palette.text.primary} />
        </View>
      )}
      <RNTextInput
        ref={inputRef}
        {...props}
        style={[
          {
            flex: 1,
            fontFamily: theme.typography.fontFamily,
            lineHeight: 24,
            color: theme.palette.text.primary,
            paddingTop: 12,
            paddingBottom: 8,
            paddingLeft: startIcon ? 0 : 4,
            paddingRight: endIcon ? 0 : 4,
            backgroundColor: 'transparent',
          },
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChangeText={handleChangeText}
      />
      {endIcon && (
        <View style={{ marginLeft: 8 }}>
          <Icon source={endIcon} size={24} color={theme.palette.text.primary} />
        </View>
      )}
    </Animated.View>
  );
};
