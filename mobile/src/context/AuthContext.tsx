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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      profileUnsub.current?.();
      babiesUnsub.current?.();
      profileUnsub.current = null;
      babiesUnsub.current = null;

      if (nextUser) {
        setUser(nextUser);
        try {
          await ensureUserProfile(nextUser);
        } catch (err) {
          console.warn('[Flourish] ensureUserProfile failed', err);
        }
        setBabiesLoaded(false);
        profileUnsub.current = subscribeUserProfile(nextUser.uid, setProfile);
        babiesUnsub.current = subscribeBabies(nextUser.uid, (next) => {
          setBabies(next);
          setBabiesLoaded(true);
          setActiveBabyId((current) => current ?? next[0]?.id ?? null);
        });
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
