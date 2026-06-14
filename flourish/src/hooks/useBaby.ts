import { useState, useEffect, useCallback } from 'react';
import { getBabiesForUser, createBaby } from '../services/firestore';
import { calculateBabyAge } from '../utils/age';
import type { Baby, BabyAgeInfo } from '../types';

interface BabyState {
  babies: Baby[];
  activeBaby: Baby | null;
  ageInfo: BabyAgeInfo | null;
  loading: boolean;
  error: string | null;
}

export function useBaby(uid: string | null) {
  const [state, setState] = useState<BabyState>({
    babies: [],
    activeBaby: null,
    ageInfo: null,
    loading: false,
    error: null,
  });

  const loadBabies = useCallback(async () => {
    if (!uid) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const babies = await getBabiesForUser(uid);
      const activeBaby = babies[0] ?? null;
      const ageInfo = activeBaby ? calculateBabyAge(activeBaby.birthDate) : null;
      setState({ babies, activeBaby, ageInfo, loading: false, error: null });
    } catch (err: unknown) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: (err as Error).message,
      }));
    }
  }, [uid]);

  useEffect(() => {
    loadBabies();
  }, [loadBabies]);

  const addBaby = useCallback(
    async (name: string, birthDate: Date) => {
      if (!uid) throw new Error('Not authenticated');
      const baby = await createBaby(uid, { name, birthDate });
      setState((prev) => {
        const babies = [...prev.babies, baby];
        const ageInfo = calculateBabyAge(baby.birthDate);
        return { ...prev, babies, activeBaby: baby, ageInfo };
      });
      return baby;
    },
    [uid]
  );

  return { ...state, loadBabies, addBaby };
}
