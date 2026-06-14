import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

import { getFirebaseClient, firebaseConfigStatus } from "@/config/firebase";
import { getAppLockEnabled, unlockPrivateSession } from "@/services/secureDevice";

type AuthContextValue = {
  configured: boolean;
  user: User | null;
  initializing: boolean;
  locked: boolean;
  unlock: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = getFirebaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!client) {
      setInitializing(false);
      return;
    }

    return onAuthStateChanged(client.auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser && (await getAppLockEnabled())) {
        setLocked(true);
      }
      setInitializing(false);
    });
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: firebaseConfigStatus.configured,
      user,
      initializing,
      locked,
      unlock: async () => {
        if (await unlockPrivateSession()) {
          setLocked(false);
        }
      },
    }),
    [initializing, locked, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
