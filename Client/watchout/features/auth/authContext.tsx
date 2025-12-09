import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          isEmailVerified: firebaseUser.emailVerified,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  const logout = async () => {
    await signOut(getAuth());
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
