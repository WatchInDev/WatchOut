import auth from "@react-native-firebase/auth";
import { apiClient } from "utils/apiClient";

export async function signUpEmail(email: string, password: string, displayName: string) {
  try {
    const cred = await auth().createUserWithEmailAndPassword(email, password);
    const user = cred.user;

    if (displayName) {
      await user.updateProfile({ displayName });
    }

    await user.sendEmailVerification();

    return user;
  } catch (err: any) {
    console.error("signUpEmail error", err);
    throw err;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const cred = await auth().signInWithEmailAndPassword(email, password);
    const user = cred.user;

    if (!user.emailVerified) {
      await user.sendEmailVerification();
      throw new Error("Email nie został jeszcze zweryfikowany. Sprawdź skrzynkę email.");
    }

    try {
      const idToken = await user.getIdToken();
      await apiClient.post(
        "/users/create",
        {
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName ?? null,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
    } catch (syncErr) {
      console.error("Backend sync failed:", syncErr);
    }

    return user;
  } catch (err: any) {
    console.error("signInWithEmail error", err);
    throw err;
  }
}

export async function logout() {
  return auth().signOut();
}

export async function resetPassword(email: string) {
  return auth().sendPasswordResetEmail(email);
}

export async function signInWithGoogleIdToken(idToken: string) {
  const credential = auth.GoogleAuthProvider.credential(idToken);
  const userCred = await auth().signInWithCredential(credential);
  const user = userCred.user;

  const firebaseIdToken = await user.getIdToken();
  await apiClient.post(
    "/users/create",
    {
      firebaseUid: user.uid,
      email: user.email,
      displayName: user.displayName ?? null,
    },
    {
      headers: { Authorization: `Bearer ${firebaseIdToken}` },
    }
  );

  return user;
}