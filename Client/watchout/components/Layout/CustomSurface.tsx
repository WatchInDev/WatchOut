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
        ...(Array.isArray(props.style) ? Object.assign({}, ...props.style) : (props.style ?? {})),
        backgroundColor: theme.palette.background.paper,
        borderRadius: 8,
      }}>
      {children}
    </Surface>
  );
};
