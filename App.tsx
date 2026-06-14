import React, { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  useFonts as useCormorantFonts,
} from "@expo-google-fonts/cormorant-garamond";
import { DMSans_400Regular, DMSans_500Medium, useFonts as useDmSansFonts } from "@expo-google-fonts/dm-sans";
import { Lora_400Regular_Italic, useFonts as useLoraFonts } from "@expo-google-fonts/lora";

import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import { AuthScreen } from "@/screens/AuthScreen";
import { MainApp } from "@/screens/MainApp";
import { colors, fontFamily, spacing } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AppGate() {
  const { configured, initializing, locked, unlock, user } = useAuth();

  if (!configured) {
    return <MainApp previewMode />;
  }

  if (initializing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.sienna} />
        <Text style={styles.loadingText}>Opening your private scrapbook...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (locked) {
    return (
      <View style={styles.centered}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockTitle}>Flourish is locked</Text>
        <Text style={styles.lockText}>Use your device unlock to open private memories on this phone.</Text>
        <Pressable onPress={unlock} style={styles.unlockButton}>
          <Text style={styles.unlockText}>Unlock Flourish</Text>
        </Pressable>
      </View>
    );
  }

  return <MainApp />;
}

export default function App() {
  const [cormorantLoaded] = useCormorantFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
  });
  const [dmSansLoaded] = useDmSansFonts({
    DMSans_400Regular,
    DMSans_500Medium,
  });
  const [loraLoaded] = useLoraFonts({
    Lora_400Regular_Italic,
  });

  const ready = cormorantLoaded && dmSansLoaded && loraLoaded;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    backgroundColor: colors.cream,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 13,
    marginTop: spacing.md,
  },
  lockIcon: {
    fontSize: 44,
    marginBottom: spacing.lg,
  },
  lockTitle: {
    color: colors.ink,
    fontFamily: fontFamily.serif,
    fontSize: 34,
  },
  lockText: {
    color: colors.inkLight,
    fontFamily: fontFamily.sans,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
    maxWidth: 300,
    textAlign: "center",
  },
  unlockButton: {
    backgroundColor: colors.sienna,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  unlockText: {
    color: colors.white,
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
