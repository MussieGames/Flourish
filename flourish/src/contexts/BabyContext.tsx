/**
 * BabyContext — single Firestore read shared across every screen.
 *
 * Before: useBaby(uid) called independently in 7+ screens → up to 7 reads.
 * After:  BabyProvider at the root reads once; every screen uses useBabyContext().
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { getBabiesForUser } from '../services/firestore';
import { calculateBabyAge } from '../utils/age';
import type { Baby, BabyAgeInfo } from '../types';

interface BabyContextValue {
  babies: Baby[];
  activeBaby: Baby | null;
  ageInfo: BabyAgeInfo | null;
  loading: boolean;
  error: string | null;
  /** Switch which child is currently shown across all screens */
  setActiveBaby: (baby: Baby) => void;
  /** Add a newly created baby to the list without re-fetching */
  addBabyToList: (baby: Baby) => void;
  refresh: () => Promise<void>;
}

const BabyContext = createContext<BabyContextValue | null>(null);

export function BabyProvider({
  uid,
  children,
}: {
  uid: string | null;
  children: React.ReactNode;
}) {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [activeBaby, setActiveBabyState] = useState<Baby | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) {
      setBabies([]);
      setActiveBabyState(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetched = await getBabiesForUser(uid);
      setBabies(fetched);
      setActiveBabyState((prev) => {
        // Preserve the active selection if it still exists in the new list
        const stillActive = fetched.find((b) => b.id === prev?.id);
        return stillActive ?? fetched[0] ?? null;
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBabyToList = useCallback((baby: Baby) => {
    setBabies((prev) => [...prev, baby]);
    setActiveBabyState(baby);
  }, []);

  const ageInfo = activeBaby ? calculateBabyAge(activeBaby.birthDate) : null;

  return (
    <BabyContext.Provider
      value={{
        babies,
        activeBaby,
        ageInfo,
        loading,
        error,
        setActiveBaby: setActiveBabyState,
        addBabyToList,
        refresh,
      }}
    >
      {children}
    </BabyContext.Provider>
  );
}

export function useBabyContext(): BabyContextValue {
  const ctx = useContext(BabyContext);
  if (!ctx) throw new Error('useBabyContext must be used within <BabyProvider>');
  return ctx;
}
