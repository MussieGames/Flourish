import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  authenticate,
  deviceSupportsBiometrics,
  isAppLockEnabled,
  setAppLockEnabled,
} from '@/lib/appLock';

interface AppLockContextValue {
  ready: boolean;
  supported: boolean;
  enabled: boolean;
  locked: boolean;
  unlock: () => Promise<boolean>;
  setEnabled: (enabled: boolean) => Promise<boolean>;
}

const AppLockContext = createContext<AppLockContextValue | undefined>(undefined);

const BACKGROUND_RELOCK_MS = 30_000;

export function AppLockProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabledState] = useState(false);
  const [locked, setLocked] = useState(false);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const [isEnabled, canBiometric] = await Promise.all([
        isAppLockEnabled(),
        deviceSupportsBiometrics(),
      ]);
      setSupported(canBiometric);
      setEnabledState(isEnabled && canBiometric);
      setLocked(isEnabled && canBiometric);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (!enabled) return;
      if (state === 'background' || state === 'inactive') {
        backgroundedAt.current = Date.now();
      } else if (state === 'active' && backgroundedAt.current) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (away >= BACKGROUND_RELOCK_MS) setLocked(true);
      }
    });
    return () => sub.remove();
  }, [enabled]);

  const unlock = useCallback(async () => {
    const ok = await authenticate('Unlock Flourish');
    if (ok) setLocked(false);
    return ok;
  }, []);

  const setEnabled = useCallback(async (next: boolean) => {
    if (next) {
      const ok = await authenticate('Confirm it’s you to turn on App Lock');
      if (!ok) return false;
    }
    await setAppLockEnabled(next);
    setEnabledState(next);
    if (!next) setLocked(false);
    return true;
  }, []);

  return (
    <AppLockContext.Provider
      value={{ ready, supported, enabled, locked, unlock, setEnabled }}
    >
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock(): AppLockContextValue {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock must be used within an AppLockProvider');
  return ctx;
}
