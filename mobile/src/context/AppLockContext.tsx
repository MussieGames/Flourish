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
  biometricLabel as readBiometricLabel,
  confirmIdentity as confirmIdentityNative,
  deviceSupportsBiometrics,
  isAppLockEnabled,
  isAppLockPrompted,
  markAppLockPrompted,
  setAppLockEnabled,
  type BiometricLabel,
} from '@/lib/appLock';

interface AppLockContextValue {
  ready: boolean;
  supported: boolean;
  enabled: boolean;
  locked: boolean;
  prompted: boolean;
  biometricLabel: BiometricLabel;
  unlock: () => Promise<boolean>;
  setEnabled: (enabled: boolean) => Promise<boolean>;
  confirmIdentity: (reason: string) => Promise<boolean>;
  skipPrompt: () => Promise<void>;
}

const AppLockContext = createContext<AppLockContextValue | undefined>(undefined);

const BACKGROUND_RELOCK_MS = 30_000;

export function AppLockProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabledState] = useState(false);
  const [locked, setLocked] = useState(false);
  const [prompted, setPrompted] = useState(true);
  const [label, setLabel] = useState<BiometricLabel>('Face ID');
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const [isEnabled, canBiometric, wasPrompted, kind] = await Promise.all([
        isAppLockEnabled(),
        deviceSupportsBiometrics(),
        isAppLockPrompted(),
        readBiometricLabel(),
      ]);
      setSupported(canBiometric);
      setEnabledState(isEnabled && canBiometric);
      setLocked(isEnabled && canBiometric);
      setLabel(kind);
      // Skip the opt-in if the device can't do it, or they already turned it on.
      const done = wasPrompted || isEnabled || !canBiometric;
      if (done && !wasPrompted) await markAppLockPrompted();
      setPrompted(done);
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
    await markAppLockPrompted();
    setEnabledState(next);
    setPrompted(true);
    if (!next) setLocked(false);
    return true;
  }, []);

  const confirmIdentity = useCallback(async (reason: string) => {
    return confirmIdentityNative(reason);
  }, []);

  const skipPrompt = useCallback(async () => {
    await markAppLockPrompted();
    setPrompted(true);
  }, []);

  return (
    <AppLockContext.Provider
      value={{
        ready,
        supported,
        enabled,
        locked,
        prompted,
        biometricLabel: label,
        unlock,
        setEnabled,
        confirmIdentity,
        skipPrompt,
      }}
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
