import React, { useState } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'components/Base/Text';
import { useNavigation } from '@react-navigation/native';
import { CustomTextInput } from 'components/Base/CustomTextInput';
import { Button, Icon } from 'react-native-paper';
import { GoogleSignInButton } from 'features/auth/GoogleSignInButton';
import { signUpEmail } from './auth';
import { AuthLayout } from 'components//Layout/AuthLayout';

export const SignUpScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSignup = async () => {
    try {
      await signUpEmail(email, password, displayName);
      Alert.alert('Sukces', 'Konto zostało utworzone');
      navigation.navigate('Login' as never);
    } catch (err: any) {
      Alert.alert('Rejestracja nie powiodła się', err.message || 'Błąd');
    }
  };

  const header = <Icon source={require('assets/watchout.png')} size={250} />;

  const footer = (
    <>
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.socialText}>Lub zarejestruj się kontem</Text>
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
    <AuthLayout header={header} footer={footer}>
      <View style={{ gap: 16 }}>
        <CustomTextInput
          placeholder="Nazwa użytkownika"
          value={displayName}
          onChangeText={setDisplayName}
        />

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

      <Button mode="contained" onPress={handleSignup} style={styles.primaryButton}>
        Zarejestruj się
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
        <Text style={styles.registerText}>Masz już konto? Zaloguj się</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  primaryButton: { marginTop: 20 },

  registerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007bff',
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
