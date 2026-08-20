import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LockScreen } from '@/components/LockScreen';
import { AppLockProvider, useAppLock } from '@/context/AppLockContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RemindersProvider, useReminders } from '@/context/RemindersContext';
import { useMilestones } from '@/hooks/useBabyData';
import { initAppCheck } from '@/firebase/config';
import { subscribeReminderResponses } from '@/lib/notifications';
import { fontAssets } from '@/theme';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { initializing, user, babies, babiesLoaded } = useAuth();
  const { ready: lockReady, prompted: lockPrompted } = useAppLock();
  const { ready: remindersReady, prompted: remindersPrompted } = useReminders();
  const segments = useSegments();
  const router = useRouter();

  const bootstrapping = initializing || !lockReady || !remindersReady;

  useEffect(() => {
    if (bootstrapping) return;

    const seg = segments as string[];
    const inAuthGroup = seg[0] === '(auth)';
    const onOnboarding = seg[0] === 'onboarding';
    const onReminders = seg[0] === 'reminders';
    const onProtect = seg[0] === 'protect';

    if (!user) {
      if (!inAuthGroup) router.replace('/(auth)/welcome');
      return;
    }

    // Signed in but hasn't created a baby profile yet.
    if (babiesLoaded && babies.length === 0) {
      if (!onOnboarding) router.replace('/onboarding');
      return;
    }

    if (babiesLoaded && babies.length > 0) {
      if (!remindersPrompted && !onReminders) {
        router.replace('/reminders');
        return;
      }
      if (remindersPrompted && !lockPrompted && !onProtect) {
        router.replace('/protect');
        return;
      }
      const atRoot = seg.length === 0;
      const atGate = inAuthGroup || onOnboarding || onReminders || onProtect || atRoot;
      if (remindersPrompted && lockPrompted && atGate) {
        router.replace('/(tabs)');
      }
    }
  }, [
    bootstrapping,
    user,
    babies.length,
    babiesLoaded,
    remindersPrompted,
    lockPrompted,
    segments,
    router,
  ]);

  if (bootstrapping) {
    return <View style={{ flex: 1, backgroundColor: colors.ink }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="protect" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="stickers" options={{ presentation: 'modal' }} />
      <Stack.Screen name="journal-entry" options={{ presentation: 'modal' }} />
      <Stack.Screen name="milestone" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="plan" options={{ presentation: 'modal' }} />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="sharing" />
    </Stack>
  );
}

function ReminderDeepLink() {
  const router = useRouter();
  const { activeBaby } = useAuth();
  const { items } = useMilestones(activeBaby?.id);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    return subscribeReminderResponses((key) => {
      const m = itemsRef.current.find((item) => item.key === key);
      router.push({
        pathname: '/milestone',
        params: {
          id: m?.id ?? '',
          key,
          label: m?.label ?? key,
          preview: m?.status === 'captured' ? undefined : '1',
        },
      });
    });
  }, [router]);

  return null;
}

function LockOverlay() {
  const { locked, unlock } = useAppLock();
  if (!locked) return null;
  return (
    <View style={StyleSheet.absoluteFill}>
      <LockScreen onUnlock={unlock} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    initAppCheck().catch(() => {});
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <AppLockProvider>
          <RemindersProvider>
            <RootNavigator />
            <LockOverlay />
            <ReminderDeepLink />
          </RemindersProvider>
        </AppLockProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
