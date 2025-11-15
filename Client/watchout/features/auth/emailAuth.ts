import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { apiClient } from "utils/apiClient";

export async function signUpEmailAndSync(email: string, password: string, displayName: string) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    const idToken = await cred.user.getIdToken(true);

    try {
      await apiClient.post(
        "/users/create",
        {
          firebaseUid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName ?? displayName ?? null,
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

    return cred.user;
  } catch (err: any) {
    console.error("signUpEmailAndSync error", err);
    throw err;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (err) {
    console.error("signInWithEmail error", err);
    throw err;
  }
}
