import React, { useEffect } from "react";
import { Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../firebase";
import { apiClient } from "utils/apiClient";
import { ANDROID_CLIENT_ID, WEB_CLIENT_ID } from "@env";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    async function handleResponse() {
      if (response?.type !== "success") return;

      const { id_token } = response.params;
      if (!id_token) {
        console.error("Google login error: no id_token");
        return;
      }

      try {
        const credential = GoogleAuthProvider.credential(id_token);
        const userCred = await signInWithCredential(auth, credential);
        const user = userCred.user;

        const firebaseIdToken = await user.getIdToken(true);

        try {
          await apiClient.post(
            "/users/create",
            {
              firebaseUid: user.uid,
              email: user.email,
              displayName: user.displayName ?? null,
            },
            {
              headers: {
                Authorization: `Bearer ${firebaseIdToken}`,
              },
            }
          );
          console.log("Backend: user synced!");
        } catch (syncErr) {
          console.error("Backend sync failed:", syncErr);
        }
      } catch (err) {
        console.error("Google login flow error:", err);
      }
    }

    handleResponse();
  }, [response]);

  return (
    <Button
      title="Sign in with Google"
      disabled={!request}
      onPress={() => promptAsync({})}
    />
  );
}