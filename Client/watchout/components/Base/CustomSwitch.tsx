import React from 'react';
import { Switch } from 'react-native';
import { theme } from 'utils/theme';

type CustomSwitchProps = React.ComponentProps<typeof Switch>;

export const CustomSwitch = (props: CustomSwitchProps) => {
  return (
    <Switch
      style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
      trackColor={{ false: theme.palette.text.tertiary, true: theme.palette.primary + '88' }}
      thumbColor={props.value ? theme.palette.primary : theme.palette.background.paper}
      {...props}
    />
  );
};
