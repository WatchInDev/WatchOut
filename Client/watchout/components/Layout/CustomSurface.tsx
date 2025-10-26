import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { theme } from 'utils/theme';

type CustomSurfaceProps = React.ComponentProps<typeof Surface> & {
  children: React.ReactNode;
};

export const CustomSurface = ({ children, ...props }: CustomSurfaceProps) => {
  return (
    <Surface
      mode="flat"
      {...props}
      style={{
      ...StyleSheet.flatten(props.style),
      backgroundColor: theme.palette.background.paper,
      borderRadius: 8,
      }}
    >
      {children}
    </Surface>
  );
};
