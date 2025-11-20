import React, { useState } from 'react';
import { Text } from 'components/Base/Text';
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { signInWithEmail, resetPassword } from './auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useNavigation } from '@react-navigation/native';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { Button, Icon } from 'react-native-paper';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      Alert.alert('Login failed', err.message || 'Nie udało się zalogować');
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
      Alert.alert('Błąd', err.message || 'Nie udało się wysłać maila');
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Icon
            source={require('assets/watchout.png')}
            size={250}
          />
        </View>
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

        <Button mode='contained' onPress={handleLogin} style={{ marginTop: 20 }} >
          Zaloguj się
        </Button>


        <View style={{ marginVertical: 10 }}>
          <GoogleSignInButton />
        </View>
        {/* Reset password link */}
        <TouchableOpacity onPress={() => setResetVisible(true)}>
          <Text style={styles.forgotText}>Zapomniałeś hasła?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
          <Text style={styles.registerText}>Nie masz konta? Zarejestruj się</Text>
        </TouchableOpacity>
      </View>

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

            <Button onPress={handleResetPassword} mode='contained' style={{ marginTop: 12 }}>
              Wyślij link resetujący
            </Button>

            <TouchableOpacity onPress={() => setResetVisible(false)} style={{ marginTop: 12 }}>
              <Text align='center' style={{ color: 'red' }}>Zamknij</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  registerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007bff',
  },
  forgotText: {
    marginTop: 12,
    textAlign: 'center',
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
});
