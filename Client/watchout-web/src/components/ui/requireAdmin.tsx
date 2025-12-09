import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin, refreshAdminStatus } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (user) {
        setChecking(true);
        await refreshAdminStatus();
        setChecking(false);
      } else {
        setChecking(false);
      }
    };
    check();
  }, [user]);

  if (loading || checking) return <div>Ładowanie...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <div>Brak dostępu: konto nie jest administratorem</div>;
  return <>{children}</>;
};
