import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { theme } from 'utils/theme';

type CustomSurfaceProps = React.ComponentProps<typeof Surface> & {
  children: React.ReactNode;
  color?: string;
  bordered?: boolean;
};

export const CustomSurface = ({ children, color, bordered = true, ...props }: CustomSurfaceProps) => {
  return (
    <Surface
      mode="flat"
      {...props}
      style={[
        {
          borderWidth: bordered ? 1 : 0,
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.primary,
          borderRadius: 8,
        },
        color ? { backgroundColor: `${color}60`, borderColor: color } : {},
        props.style,
      ]}>
      {children}
    </Surface>
  );
};
