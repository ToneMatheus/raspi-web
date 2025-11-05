// src/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login, setAuthToken } from "../../services/Auth";

type User = { id: string; username: string } | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  token: string | null;
  /** Derived flags – no DB changes required */
  isGuest: boolean;
  isAdmin: boolean;
    /** Optional helper for feature gating in UI/routing */
  canAccess: (feature: "spending" | "wedding" | "spotai" | "about" | "reader") => boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  token: null,
  isGuest: false,
  isAdmin: false,
  canAccess: () => false,
  signIn: async () => {},
  signOut: () => {},
});

const TOKEN_KEY = "jwt_token"; // use "sessionStorage" to keep auth only while tab/window is open

/** Centralize your guest logic here (no DB change). */
const isGuestId = (id?: string | null) => id === "3";

/** Optional: feature access rules (purely client-side). */
const featureAccess = (args: { isGuest: boolean; isAdmin: boolean }) => ({
  spending: true,
  wedding: args.isAdmin,  // guests cannot access
  spotai: args.isAdmin,   // guests cannot access
  about: true,
  reader: args.isAdmin,   // guests cannot access
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  
  // Derived flags (computed from user.id only; DB not touched)
  const { isGuest, isAdmin } = useMemo(() => {
    const guest = isGuestId(user?.id ?? null);
    return { isGuest: guest, isAdmin: !guest && !!user }; // treat everyone else as "admin" for gating
  }, [user]);

  const canAccess = useMemo(() => {
    const rules = featureAccess({ isGuest, isAdmin });
    return (feature: keyof typeof rules) => !!rules[feature];
  }, [isGuest, isAdmin]);

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
    console.log("Signed in user:", me.id);
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    sessionStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, isGuest, isAdmin, canAccess, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
