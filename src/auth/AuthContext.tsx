import React, { createContext, useContext, useEffect, useState } from "react";
import {
  clearTokens,
  getUsername,
  restoreSession,
  revokeSession,
} from "../lib/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const restore = () => {
      void restoreSession()
        .then((authenticated) => {
          if (mounted) {
            setIsAuthenticated(authenticated);
            setUsername(authenticated ? getUsername() : null);
          }
        })
        .catch(() => {
          clearTokens();
          if (mounted) {
            setIsAuthenticated(false);
            setUsername(null);
          }
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    };

    const handleAuthChange = () => {
      void restoreSession()
        .then((authenticated) => {
          if (mounted) {
            setIsAuthenticated(authenticated);
            setUsername(authenticated ? getUsername() : null);
          }
        })
        .catch(() => {
          if (mounted) {
            setIsAuthenticated(false);
            setUsername(null);
          }
        });
    };

    window.addEventListener("news-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    restore();

    return () => {
      mounted = false;
      window.removeEventListener("news-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const logout = async () => {
    try {
      await revokeSession();
    } finally {
      setIsAuthenticated(false);
      setUsername(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, username, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
