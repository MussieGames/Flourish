import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
} from "@expo-google-fonts/cormorant-garamond";
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import { Lora_400Regular_Italic } from "@expo-google-fonts/lora";

import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { ChildProvider, useChild } from "../src/context/ChildContext";
import { Loading } from "../src/components/ui";
import { colors } from "../src/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { user, initializing } = useAuth();
  const { children, loading: childrenLoading } = useChild();
  const segments = useSegments();
  const router = useRouter();

  const ready = !initializing && (!user || !childrenLoading);

  useEffect(() => {
    if (!ready) return;

    const group = segments[0];
    const inAuth = group === "(auth)";
    const inOnboarding = group === "(onboarding)";

    if (!user) {
      if (!inAuth) router.replace("/(auth)/welcome");
      return;
    }

    const hasChild = children.length > 0;
    if (!hasChild && !inOnboarding) {
      router.replace("/(onboarding)/child");
      return;
    }
    if (hasChild && (inAuth || inOnboarding)) {
      router.replace("/(tabs)");
    }
  }, [ready, user, children.length, segments, router]);

  if (!ready) {
    return <Loading dark label="Flourish" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="stickers" options={{ presentation: "modal" }} />
      <Stack.Screen name="plan" options={{ presentation: "modal" }} />
      <Stack.Screen name="capture" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="milestone"
        options={{ presentation: "fullScreenModal", animation: "fade" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    Lora_400Regular_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ChildProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </ChildProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
