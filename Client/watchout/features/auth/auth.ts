import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  getIdToken,
  firebase,
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { apiClient } from 'utils/apiClient';
import { API_ENDPOINTS } from 'utils/apiDefinition';
import { AuthError } from 'utils/AuthError';

export async function signUpEmail(email: string, password: string, displayName?: string) {
  try {
    const auth = getAuth(); // modularne pobranie auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    await sendEmailVerification(user);

    return user;
  } catch (err: any) {
    console.error('signUpEmail error', err);
    throw err;
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User | { error: string }> {
  try {
    const auth = getAuth();
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    if (!user.emailVerified) {
      await sendEmailVerification(user);
      throw new AuthError('Email nie został jeszcze zweryfikowany. Sprawdź skrzynkę email.');
    }

    try {
      const idToken = await getIdToken(user);
      await apiClient.post(
        API_ENDPOINTS.users.create,
        {
          firebaseUid: user.uid,
          email: user.email,
          displayName: user.displayName ?? null,
        },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      return user;
    } catch (syncErr) {
      console.error('Backend sync failed:', syncErr);
      throw new AuthError(
        'Nie udało się zsynchronizować konta z serwerem. Spróbuj ponownie później.'
      );
    }
  } catch (err: any) {
    console.error('signInWithEmail error', err);
    throw err;
  }
}

export async function logout() {
  const auth = getAuth();
  return signOut(auth);
}

export async function resetPassword(email: string) {
  const auth = getAuth();
  return sendPasswordResetEmail(auth, email);
}

export async function signInWithGoogleIdToken(idToken: string) {
  const auth = getAuth();
  const credential = GoogleAuthProvider.credential(idToken);
  const userCred = await signInWithCredential(auth, credential);
  const user = userCred.user;

  const firebaseIdToken = await getIdToken(user);
  await apiClient.post(
    '/users/create',
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
