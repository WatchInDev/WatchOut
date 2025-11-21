import React from 'react'
import { View, ViewProps } from 'react-native';

type RowProps = ViewProps;

export const Row = ({ children, style, ...rest }: RowProps) => {
  return (
    <View style={[{ flexDirection: 'row' }, style]} {...rest}>{children}</View>
  )
}
