import React from 'react'
import { View } from 'react-native';

type StackProps = {
  children: React.ReactNode;
  [key: string]: any;
};

export const Stack = ({ children, ...props }: StackProps) => {
  return (
    <View style={{ flexDirection: 'column', ...props.style }} {...props}>
      {children}
    </View>
  )
}
