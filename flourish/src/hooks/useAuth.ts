import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, signOut, getAuthErrorMessage } from '../services/auth';

interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    initialized: false,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setState({ user, loading: false, initialized: true, error: null });
    });
    return unsubscribe;
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signOut();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: getAuthErrorMessage(code),
      }));
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    initialized: state.initialized,
    isAuthenticated: !state.loading && state.user !== null,
    isEmailVerified: state.user?.emailVerified ?? false,
    error: state.error,
    logout,
  };
}
