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
        borderWidth: 1,
        borderColor: theme.palette.primary,
        borderRadius: 8,
      ...StyleSheet.flatten(props.style),
      }}
    >
      {children}
    </Surface>
  );
};
