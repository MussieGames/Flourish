import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useMilestones } from '@/hooks/useBabyData';
import { syncCatalogueMilestones } from '@/firebase/firestore';
import {
  getReminderPermission,
  loadReminderPrefs,
  markRemindersPrompted,
  requestReminderPermission,
  rescheduleMilestoneReminders,
  saveReminderEnabled,
  type ReminderPermission,
} from '@/lib/notifications';

interface RemindersContextValue {
  ready: boolean;
  enabled: boolean;
  prompted: boolean;
  permission: ReminderPermission;
  enableReminders: () => Promise<boolean>;
  disableReminders: () => Promise<void>;
  skipReminders: () => Promise<void>;
}

const RemindersContext = createContext<RemindersContextValue | undefined>(undefined);

export function RemindersProvider({ children }: { children: ReactNode }) {
  const { user, activeBaby } = useAuth();
  const { items: milestones } = useMilestones(activeBaby?.id);

  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [prompted, setPrompted] = useState(true);
  const [permission, setPermission] = useState<ReminderPermission>('undetermined');
  const syncedBaby = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [prefs, perm] = await Promise.all([loadReminderPrefs(), getReminderPermission()]);
      if (cancelled) return;
      setEnabled(prefs.enabled);
      setPrompted(prefs.prompted);
      setPermission(perm);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeBaby?.id || !user) return;
    if (syncedBaby.current === activeBaby.id) return;
    syncedBaby.current = activeBaby.id;
    syncCatalogueMilestones(activeBaby.id, user.uid).catch(() => {});
  }, [activeBaby?.id, user]);

  const capturedKey = milestones
    .filter((m) => m.status === 'captured')
    .map((m) => m.key)
    .sort()
    .join('|');
  const capturedKeysRef = useRef<string[]>([]);
  capturedKeysRef.current = capturedKey ? capturedKey.split('|') : [];

  const refresh = useCallback(async (nextEnabled: boolean) => {
    return rescheduleMilestoneReminders({
      enabled: nextEnabled,
      birthDate: activeBaby?.birthDate,
      babyName: activeBaby?.name ?? 'your baby',
      capturedKeys: capturedKeysRef.current,
    });
  }, [activeBaby?.birthDate, activeBaby?.name]);

  useEffect(() => {
    if (!ready) return;
    refresh(enabled).catch(() => {});
  }, [ready, enabled, activeBaby?.id, activeBaby?.birthDate, capturedKey, refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      getReminderPermission().then(setPermission).catch(() => {});
      if (ready) refresh(enabled).catch(() => {});
    });
    return () => sub.remove();
  }, [ready, enabled, refresh]);

  const enableReminders = useCallback(async () => {
    const ok = await requestReminderPermission();
    setPermission(ok ? 'granted' : 'denied');
    await saveReminderEnabled(ok);
    setPrompted(true);
    setEnabled(ok);
    if (ok) await refresh(true);
    return ok;
  }, [refresh]);

  const disableReminders = useCallback(async () => {
    await saveReminderEnabled(false);
    setEnabled(false);
    setPrompted(true);
    await refresh(false);
  }, [refresh]);

  const skipReminders = useCallback(async () => {
    await markRemindersPrompted();
    setPrompted(true);
  }, []);

  const value = useMemo<RemindersContextValue>(
    () => ({
      ready,
      enabled,
      prompted,
      permission,
      enableReminders,
      disableReminders,
      skipReminders,
    }),
    [ready, enabled, prompted, permission, enableReminders, disableReminders, skipReminders],
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersContextValue {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used within RemindersProvider');
  return ctx;
}
