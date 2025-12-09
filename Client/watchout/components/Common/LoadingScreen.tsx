import { ActivityIndicator, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { Text } from 'components/Base/Text';

export const LoadingScreen = () => {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
      <Icon source={require('assets/watchout.png')} size={250} />
      <Text variant="h4" style={{ marginTop: 16 }}>
        Ładowanie...
      </Text>
      <ActivityIndicator size="large" style={{ marginTop: 16 }} />
    </View>
  );
};
