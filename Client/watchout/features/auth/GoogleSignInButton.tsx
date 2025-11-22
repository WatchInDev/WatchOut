import { Icon } from 'react-native-paper';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { signInWithGoogleIdToken } from './auth';
import { WEB_CLIENT_ID } from '@env';

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
    <TouchableOpacity style={styles.button} onPress={signIn}>
      <Icon source={require('../../assets/icons/google-logo.png')} size={28} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',

    elevation: 4,

    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});

