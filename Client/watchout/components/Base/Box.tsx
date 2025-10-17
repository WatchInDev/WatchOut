import { View } from "react-native";

type BoxProps = {
  children: React.ReactNode;
  [key: string]: any;
};

export const Box = ({ children, ...props }: BoxProps) => {
  return (
    <View {...props}>
      {children}
    </View>
  );
};
