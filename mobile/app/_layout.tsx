import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LockScreen } from '@/components/LockScreen';
import { AppLockProvider, useAppLock } from '@/context/AppLockContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { initAppCheck } from '@/firebase/config';
import { fontAssets } from '@/theme';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { initializing, user, babies, babiesLoaded } = useAuth();
  const { ready: lockReady } = useAppLock();
  const segments = useSegments();
  const router = useRouter();

  const bootstrapping = initializing || !lockReady;

  useEffect(() => {
    if (bootstrapping) return;

    const seg = segments as string[];
    const inAuthGroup = seg[0] === '(auth)';
    const onOnboarding = seg[0] === 'onboarding';

    if (!user) {
      if (!inAuthGroup) router.replace('/(auth)/welcome');
      return;
    }

    // Signed in but hasn't created a baby profile yet.
    if (babiesLoaded && babies.length === 0) {
      if (!onOnboarding) router.replace('/onboarding');
      return;
    }

    const atRoot = seg.length === 0;
    if (babiesLoaded && babies.length > 0 && (inAuthGroup || onOnboarding || atRoot)) {
      router.replace('/(tabs)');
    }
  }, [bootstrapping, user, babies.length, babiesLoaded, segments, router]);

  if (bootstrapping) {
    return <View style={{ flex: 1, backgroundColor: colors.ink }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="stickers" options={{ presentation: 'modal' }} />
      <Stack.Screen name="journal-entry" options={{ presentation: 'modal' }} />
      <Stack.Screen name="milestone" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="plan" options={{ presentation: 'modal' }} />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="journal" />
    </Stack>
  );
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
          <RootNavigator />
          <LockOverlay />
        </AppLockProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
