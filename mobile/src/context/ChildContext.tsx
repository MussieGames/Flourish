import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ChildProfile } from "../types";
import { subscribeChildren, setActiveChild } from "../services/children";
import { useAuth } from "./AuthContext";

interface ChildContextValue {
  children: ChildProfile[];
  activeChild: ChildProfile | null;
  loading: boolean;
  selectChild: (childId: string) => Promise<void>;
}

const ChildContext = createContext<ChildContextValue>({
  children: [],
  activeChild: null,
  loading: true,
  selectChild: async () => {},
});

export function ChildProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [list, setList] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeChildren(
      user.uid,
      (children) => {
        setList(children);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [user]);

  const activeChild = useMemo(() => {
    if (list.length === 0) return null;
    const preferred = profile?.activeChildId
      ? list.find((c) => c.id === profile.activeChildId)
      : undefined;
    return preferred ?? list[0];
  }, [list, profile?.activeChildId]);

  const value = useMemo<ChildContextValue>(
    () => ({
      children: list,
      activeChild,
      loading,
      selectChild: async (childId: string) => {
        if (user) await setActiveChild(user.uid, childId);
      },
    }),
    [list, activeChild, loading, user],
  );

  return (
    <ChildContext.Provider value={value}>{children}</ChildContext.Provider>
  );
}

export function useChild(): ChildContextValue {
  return useContext(ChildContext);
}
