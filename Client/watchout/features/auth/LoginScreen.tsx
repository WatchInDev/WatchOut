import React, { useState } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Text } from 'components/Base/Text';
import { useNavigation } from '@react-navigation/native';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { Button, Icon } from 'react-native-paper';
import { GoogleSignInButton } from 'features/auth/GoogleSignInButton';
import { signInWithEmail, resetPassword } from './auth';
import { AuthLayout } from 'components/Layout/AuthLayout';
import { AuthError } from 'utils/AuthError';
import { firebaseAuthErrorMessages } from 'utils/dictionaries';

export const LoginScreen = () => {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmail(email, password);
      navigate('Map' as never);
    } catch (err: any) {
      if (err.code && err.code in firebaseAuthErrorMessages) {
        Alert.alert('Ups! Coś poszło nie tak', firebaseAuthErrorMessages[err.code]);
        return;
      }
      Alert.alert(
        'Ups! Coś poszło nie tak',
        'Nie udało się zalogować. Spróbuj ponownie później. Przepraszamy za utrudnienia.'
      );
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Błąd', 'Podaj email');
      return;
    }
    try {
      await resetPassword(resetEmail);
      Alert.alert('Sukces', 'Sprawdź skrzynkę email.');
      setResetVisible(false);
      setResetEmail('');
    } catch (err: any) {
      if (err.code && err.code in firebaseAuthErrorMessages) {
        Alert.alert('Ups! Coś poszło nie tak', firebaseAuthErrorMessages[err.code]);
        return;
      }
      if (err instanceof AuthError) {
        Alert.alert('Ups! Coś poszło nie tak', err.message);
        return;
      }
      Alert.alert(
        'Ups! Coś poszło nie tak',
        'Nie udało się zarejestrować. Spróbuj ponownie później. Przepraszamy za utrudnienia.'
      );
    }
  };

  const header = <Icon source={require('assets/watchout.png')} size={150} />;

  const footer = (
    <>
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.socialText}>Lub zaloguj się kontem</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.socialButtonsWrapper}>
        <View style={styles.googleWrapper}>
          <GoogleSignInButton />
        </View>
      </View>
    </>
  );

  return (
    <>
      <AuthLayout header={header} footer={footer}>
        <View style={{ gap: 16 }}>
          <CustomTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <CustomTextInput
            placeholder="Hasło"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity onPress={() => setResetVisible(true)} style={{ alignSelf: 'flex-end' }}>
          <Text style={styles.forgotText}>Zapomniałeś hasła?</Text>
        </TouchableOpacity>

        <Button mode="contained" onPress={handleLogin} style={styles.primaryButton}>
          Zaloguj się
        </Button>

        <TouchableOpacity onPress={() => navigate('SignUp' as never)}>
          <Text style={styles.registerText}>Nie masz konta? Zarejestruj się</Text>
        </TouchableOpacity>
      </AuthLayout>

      <Modal visible={resetVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Resetowanie hasła</Text>

            <CustomTextInput
              placeholder="Twój email"
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Button onPress={handleResetPassword} mode="contained" style={{ marginTop: 12 }}>
              Wyślij link resetujący
            </Button>

            <TouchableOpacity onPress={() => setResetVisible(false)} style={{ marginTop: 12 }}>
              <Text align="center" style={{ color: 'red' }}>
                Zamknij
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  primaryButton: { marginTop: 20 },

  registerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007bff',
  },

  forgotText: {
    marginTop: 12,
    textAlign: 'right',
    color: '#007bff',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },

  socialText: {
    color: '#606060',
    fontSize: 16,
  },

  socialButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  googleWrapper: {
    width: '70%',
    alignItems: 'center',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#606060',
    marginHorizontal: 10,
  },
});
