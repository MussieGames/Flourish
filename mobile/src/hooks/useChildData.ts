import { useEffect, useState } from "react";

import type {
  CalendarEvent,
  JournalEntry,
  Memory,
  Milestone,
} from "../types";
import { subscribeMemories } from "../services/memories";
import { subscribeMilestones } from "../services/milestones";
import { subscribeJournal } from "../services/journal";
import { subscribeEvents } from "../services/events";

interface State<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

function emptyState<T>(): State<T> {
  return { data: [], loading: true, error: null };
}

export function useMemories(childId?: string, limit?: number): State<Memory> {
  const [state, setState] = useState<State<Memory>>(emptyState);
  useEffect(() => {
    if (!childId) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState(emptyState);
    return subscribeMemories(
      childId,
      (data) => setState({ data, loading: false, error: null }),
      {
        limit,
        onError: (e) =>
          setState({ data: [], loading: false, error: e.message }),
      },
    );
  }, [childId, limit]);
  return state;
}

export function useMilestones(childId?: string): State<Milestone> {
  const [state, setState] = useState<State<Milestone>>(emptyState);
  useEffect(() => {
    if (!childId) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState(emptyState);
    return subscribeMilestones(
      childId,
      (data) => setState({ data, loading: false, error: null }),
      (e) => setState({ data: [], loading: false, error: e.message }),
    );
  }, [childId]);
  return state;
}

export function useJournal(childId?: string): State<JournalEntry> {
  const [state, setState] = useState<State<JournalEntry>>(emptyState);
  useEffect(() => {
    if (!childId) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState(emptyState);
    return subscribeJournal(
      childId,
      (data) => setState({ data, loading: false, error: null }),
      (e) => setState({ data: [], loading: false, error: e.message }),
    );
  }, [childId]);
  return state;
}

export function useEvents(childId?: string): State<CalendarEvent> {
  const [state, setState] = useState<State<CalendarEvent>>(emptyState);
  useEffect(() => {
    if (!childId) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    setState(emptyState);
    return subscribeEvents(
      childId,
      (data) => setState({ data, loading: false, error: null }),
      (e) => setState({ data: [], loading: false, error: e.message }),
    );
  }, [childId]);
  return state;
}
