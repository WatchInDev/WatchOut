import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>{children}</View>
    </SafeAreaView>
  );
};
