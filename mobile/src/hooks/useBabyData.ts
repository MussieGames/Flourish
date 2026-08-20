import { useEffect, useState } from 'react';
import {
  subscribeEvents,
  subscribeJournal,
  subscribeMemories,
  subscribeMilestones,
} from '@/firebase/firestore';
import type { CalendarEvent, JournalEntry, Memory, Milestone } from '@/types/models';

interface AsyncList<T> {
  items: T[];
  loading: boolean;
  error: string | null;
}

function useSubscription<T>(
  babyId: string | null | undefined,
  subscribe: (
    babyId: string,
    cb: (items: T[]) => void,
    onError?: (e: Error) => void,
  ) => () => void,
): AsyncList<T> {
  const [state, setState] = useState<AsyncList<T>>({ items: [], loading: true, error: null });

  useEffect(() => {
    if (!babyId) {
      setState({ items: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribe(
      babyId,
      (items) => setState({ items, loading: false, error: null }),
      (e) => setState({ items: [], loading: false, error: e.message }),
    );
    return unsub;
  }, [babyId, subscribe]);

  return state;
}

export function useMemories(babyId: string | null | undefined) {
  return useSubscription<Memory>(babyId, subscribeMemories);
}

export function useMilestones(babyId: string | null | undefined) {
  return useSubscription<Milestone>(babyId, subscribeMilestones);
}

export function useJournal(babyId: string | null | undefined) {
  return useSubscription<JournalEntry>(babyId, subscribeJournal);
}

export function useEvents(babyId: string | null | undefined) {
  return useSubscription<CalendarEvent>(babyId, subscribeEvents);
}
