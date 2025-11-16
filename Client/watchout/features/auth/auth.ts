import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "../../firebase";
import { apiClient } from "utils/apiClient";

export async function signUpEmail(email: string, password: string, displayName: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    await sendEmailVerification(cred.user);

    return cred.user;
  } catch (err: any) {
    console.error("signUpEmail error", err);
    throw err;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    if (!user.emailVerified) {
      await sendEmailVerification(user);
      throw new Error(
        "Email nie został jeszcze zweryfikowany. Sprawdź skrzynkę email."
      );
    }

    try {
      const idToken = await user.getIdToken(true);
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
  return signOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}
