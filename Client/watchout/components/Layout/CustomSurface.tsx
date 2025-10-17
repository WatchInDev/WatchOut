import { Surface } from 'react-native-paper';

type CustomSurfaceProps = React.ComponentProps<typeof Surface> & {
  children: React.ReactNode;
};

export const CustomSurface = ({ children, ...props }: CustomSurfaceProps) => {
  return <Surface mode="flat" {...props}>{children}</Surface>;
};
