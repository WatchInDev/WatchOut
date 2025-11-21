import { View } from 'react-native';

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return <View style={{ flex: 1, padding: 16 }}>{children}</View>;
};
