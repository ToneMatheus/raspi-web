// src/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe, login, setAuthToken } from "../../services/Auth";

type User = { id: string; username: string } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  token: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  token: null,
  signIn: async () => {},
  signOut: () => {},
});

const TOKEN_KEY = "jwt_token"; // use "sessionStorage" to keep auth only while tab/window is open

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      setAuthToken(saved);
      // Try to hydrate the user
      getMe()
        .then((u) => setUser(u))
        .catch(() => {
          // token invalid/expired
          setToken(null);
          setAuthToken(null);
          sessionStorage.removeItem(TOKEN_KEY);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (username: string, password: string) => {
    const { token } = await login(username, password);
    setToken(token);
    setAuthToken(token);
    sessionStorage.setItem(TOKEN_KEY, token);

    const me = await getMe();
    setUser(me);
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    sessionStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
