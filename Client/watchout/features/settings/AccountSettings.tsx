import { View } from 'react-native';
import { Text } from 'components/Base/Text';
import { useAuth } from 'features/auth/authContext';
import { PageWrapper } from 'components/Common/PageWrapper';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { Button } from 'react-native-paper';

export const AccountSettings = () => {
  const { user, logout } = useAuth();

  return (
    <PageWrapper>
      <View style={{ gap: 16 }}>
        <CustomSurface style={{ padding: 16, gap: 8 }}>
          <Text>Zalogowano jako:</Text>
          <Text variant="h4">{user?.displayName}</Text>
        </CustomSurface>
        <CustomSurface style={{ padding: 16, gap: 8 }}>
          <Text>Adres e-mail:</Text>
          <Text variant="h4">{user?.email}</Text>
        </CustomSurface>
      </View>
      <Button mode="contained" style={{ marginTop: 16 }} onPress={logout}>
        Wyloguj się
      </Button>
    </PageWrapper>
  );
};
