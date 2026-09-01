import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
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
import { auth } from '@/firebase/config';
import {
  ensureUserProfile,
  subscribeBabies,
  subscribeUserProfile,
} from '@/firebase/firestore';
import type { Baby, UserProfile } from '@/types/models';
import { checkPassword, isValidEmail } from '@/lib/validation';

interface AuthContextValue {
  initializing: boolean;
  user: User | null;
  profile: UserProfile | null;
  emailVerified: boolean;
  babies: Baby[];
  babiesLoaded: boolean;
  activeBaby: Baby | null;
  setActiveBabyId: (id: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, babyName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  reloadUser: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [babiesLoaded, setBabiesLoaded] = useState(false);
  const [activeBabyId, setActiveBabyId] = useState<string | null>(null);

  const profileUnsub = useRef<(() => void) | null>(null);
  const babiesUnsub = useRef<(() => void) | null>(null);
  const authGeneration = useRef(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      const generation = authGeneration.current + 1;
      authGeneration.current = generation;
      profileUnsub.current?.();
      babiesUnsub.current?.();
      profileUnsub.current = null;
      babiesUnsub.current = null;

      if (nextUser) {
        const uid = nextUser.uid;
        setUser(nextUser);
        setProfile(null);
        setBabies([]);
        setBabiesLoaded(false);
        setActiveBabyId(null);
        try {
          await ensureUserProfile(nextUser);
        } catch (err) {
          console.warn('[Flourish] ensureUserProfile failed', err);
        }
        if (authGeneration.current !== generation || auth.currentUser?.uid !== uid) {
          return;
        }
        profileUnsub.current = subscribeUserProfile(
          uid,
          (next) => {
            if (authGeneration.current === generation) setProfile(next);
          },
          (err) => {
            if (authGeneration.current !== generation) return;
            console.warn('[Flourish] subscribeUserProfile failed', err);
            setProfile(null);
          },
        );
        babiesUnsub.current = subscribeBabies(
          uid,
          (next) => {
            if (authGeneration.current !== generation) return;
            setBabies(next);
            setBabiesLoaded(true);
            setActiveBabyId((current) => current ?? next[0]?.id ?? null);
          },
          (err) => {
            if (authGeneration.current !== generation) return;
            console.warn('[Flourish] subscribeBabies failed', err);
            setBabies([]);
            setBabiesLoaded(true);
            setActiveBabyId(null);
          },
        );
      } else {
        setUser(null);
        setProfile(null);
        setBabies([]);
        setBabiesLoaded(false);
        setActiveBabyId(null);
      }
      setInitializing(false);
    });

    return () => {
      authGeneration.current += 1;
      unsub();
      profileUnsub.current?.();
      babiesUnsub.current?.();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) throw new Error('Please enter a valid email address.');
    if (!password) throw new Error('Please enter your password.');
    await signInWithEmailAndPassword(auth, cleanEmail, password);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, babyName?: string) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!isValidEmail(cleanEmail)) throw new Error('Please enter a valid email address.');
      const strength = checkPassword(password);
      if (!strength.ok) throw new Error(strength.problems[0] ?? 'Please choose a stronger password.');

      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (babyName?.trim()) {
        await updateProfile(credential.user, { displayName: babyName.trim().slice(0, 40) });
      }
      try {
        await sendEmailVerification(credential.user);
      } catch (err) {
        console.warn('[Flourish] sendEmailVerification failed', err);
      }
    },
    [],
  );

  const resetPassword = useCallback(async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) throw new Error('Please enter a valid email address.');
    await sendPasswordResetEmail(auth, cleanEmail);
  }, []);

  const resendVerification = useCallback(async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  }, []);

  const reloadUser = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(auth.currentUser ? { ...auth.currentUser } as User : null);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const activeBaby = useMemo(
    () => babies.find((b) => b.id === activeBabyId) ?? babies[0] ?? null,
    [babies, activeBabyId],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      initializing,
      user,
      profile,
      emailVerified: user?.emailVerified ?? false,
      babies,
      babiesLoaded,
      activeBaby,
      setActiveBabyId,
      signIn,
      signUp,
      resetPassword,
      resendVerification,
      reloadUser,
      signOutUser,
    }),
    [
      initializing,
      user,
      profile,
      babies,
      babiesLoaded,
      activeBaby,
      signIn,
      signUp,
      resetPassword,
      resendVerification,
      reloadUser,
      signOutUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
