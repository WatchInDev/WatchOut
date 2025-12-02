// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { apiClient } from "@/utils/apiClient";

type AuthContextType = {
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAdmin(false);
      if (u) {
        await u.getIdToken(true);
        await checkAdminOnBackend();
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const checkAdminOnBackend = async () => {
    try {
      await apiClient.get("/admin/check");
      setIsAdmin(true);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await cred.user.getIdToken(true);
    await checkAdminOnBackend();
    setUser(cred.user);
    setLoading(false);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  const refreshAdminStatus = async () => {
    if (!auth.currentUser) {
      setIsAdmin(false);
      return;
    }
    await auth.currentUser.getIdToken(true);
    await checkAdminOnBackend();
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut, refreshAdminStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
