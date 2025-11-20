import { Button, Icon } from 'react-native-paper';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { signInWithGoogleIdToken } from './auth';
import { WEB_CLIENT_ID } from '@env';
import { theme } from 'utils/theme';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
});

export const GoogleSignInButton = () => {
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error('No idToken returned from Google Sign-In');

      await signInWithGoogleIdToken(idToken);

      console.log('Google login + backend sync OK');
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled login');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        console.log('Signin in progress');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error('Play services not available');
      } else {
        console.error('Google login error:', err);
      }
    }
  };

  return (
    <Button
      mode="contained"
      onPress={signIn}
      icon={({ size }) => <Icon source="google" size={size} color={theme.palette.text.primaryInverse} />}>
      Zaloguj się przez Google
    </Button>
  );
};
