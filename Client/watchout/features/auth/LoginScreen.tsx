import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";
import { signInWithEmail, resetPassword } from "./auth";
import GoogleSignInButton from "./googleAuth";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      Alert.alert("Login failed", err.message || "Nie udało się zalogować");
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      Alert.alert("Błąd", "Podaj email");
      return;
    }

    try {
      await resetPassword(resetEmail);
      Alert.alert("Sukces", "Sprawdź skrzynkę email.");
      setResetVisible(false);
      setResetEmail("");
    } catch (err: any) {
      Alert.alert("Błąd", err.message || "Nie udało się wysłać maila");
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Button title="Zaloguj się" onPress={handleLogin} />

        {/* Reset password link */}
        <TouchableOpacity onPress={() => setResetVisible(true)}>
          <Text style={styles.forgotText}>Zapomniałeś hasła?</Text>
        </TouchableOpacity>

        <View style={{ marginVertical: 10 }}>
          <GoogleSignInButton />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("SignUp" as never)}>
          <Text style={styles.registerText}>Nie masz konta? Zarejestruj się</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={resetVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Resetowanie hasła</Text>

            <TextInput
              placeholder="Twój email"
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Button title="Wyślij link resetujący" onPress={handleResetPassword} />

            <TouchableOpacity
              onPress={() => setResetVisible(false)}
              style={{ marginTop: 12 }}
            >
              <Text style={{ color: "red", textAlign: "center" }}>Zamknij</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
  registerText: {
    marginTop: 20,
    textAlign: "center",
    color: "#007bff",
    fontSize: 16,
  },
  forgotText: {
    marginTop: 12,
    textAlign: "center",
    color: "#007bff",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
});
