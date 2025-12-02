import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div>Ładowanie...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <div>Brak dostępu: konto nie jest administratorem</div>;
  return <>{children}</>;
};