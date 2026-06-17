import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Field, FlourishButton, SerifTitle } from "@/components/ui";
import { colors, fontFamily, spacing } from "@/theme";
import { loginWithEmail, registerWithEmail, requestPasswordReset } from "@/services/flourishData";
import { getLastEmail, saveLastEmail } from "@/services/secureDevice";

export function AuthScreen() {
  const [mode, setMode] = useState<"signIn" | "register">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getLastEmail().then((value) => {
      if (value) {
        setEmail(value);
      }
    });
  }, []);

  async function submit() {
    setBusy(true);
    try {
      if (mode === "register" && !acceptedLegal) {
        Alert.alert(
          "Confirmation required",
          "Please confirm you are an adult parent or legal guardian and accept the Terms and Privacy Policy.",
        );
        return;
      }

      if (mode === "register") {
        await registerWithEmail({ email, password, displayName });
      } else {
        await loginWithEmail(email, password);
      }
      await saveLastEmail(email);
    } catch (error) {
      Alert.alert("Could not continue", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    try {
      await requestPasswordReset(email);
      Alert.alert("Check your email", "If an account exists, Firebase has sent a password reset link.");
    } catch (error) {
      Alert.alert("Could not send reset", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <LinearGradient colors={[colors.ink, "#3D2820"]} style={styles.hero}>
        <Text style={styles.leaf}>🌿</Text>
        <SerifTitle light size={42}>
          Welcome to{"\n"}Flourish.
        </SerifTitle>
        <Text style={styles.heroText}>
          A private scrapbook for every first, secured with Firebase Authentication and rules that keep each family in
          its own space.
        </Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.formLabel}>{mode === "register" ? "Create your private account" : "Sign in privately"}</Text>
        {mode === "register" ? (
          <Field
            autoCapitalize="words"
            icon="👤"
            onChangeText={setDisplayName}
            placeholder="Your name"
            textContentType="name"
            value={displayName}
          />
        ) : null}
        <Field
          autoCapitalize="none"
          autoComplete="email"
          icon="✉️"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email address"
          textContentType="emailAddress"
          value={email}
        />
        <Field
          autoCapitalize="none"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          icon="🔒"
          onChangeText={setPassword}
          placeholder={mode === "register" ? "Password: 12+ chars, mixed case + number" : "Password"}
          secureTextEntry
          textContentType={mode === "register" ? "newPassword" : "password"}
          value={password}
        />
        {mode === "register" ? (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedLegal }}
            onPress={() => setAcceptedLegal((value) => !value)}
            style={styles.legalConsent}
          >
            <View style={[styles.checkbox, acceptedLegal && styles.checkboxChecked]}>
              {acceptedLegal ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </View>
            <Text style={styles.legalConsentText}>
              I am an adult parent or legal guardian and I accept the Terms and Conditions and Privacy Policy for
              managing child memories.
            </Text>
          </Pressable>
        ) : null}
        <FlourishButton
          disabled={busy || (mode === "register" && !acceptedLegal)}
          onPress={submit}
          title={mode === "register" ? "Create secure account" : "Sign in"}
        />
        <Pressable onPress={() => setMode(mode === "register" ? "signIn" : "register")} style={styles.switcher}>
          <Text style={styles.switcherText}>
            {mode === "register" ? "Already have an account? Sign in" : "New to Flourish? Create an account"}
          </Text>
        </Pressable>
        {mode === "signIn" ? (
          <Pressable onPress={resetPassword} style={styles.switcher}>
            <Text style={styles.resetText}>Forgot password?</Text>
          </Pressable>
        ) : null}
        <Text style={styles.securityNote}>
          Security by default: no guest cloud writes, strong password guidance, Firebase rules, private Storage paths,
          and optional device unlock after sign-in.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  hero: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: 72,
  },
  leaf: {
    fontSize: 38,
    marginBottom: spacing.lg,
  },
  heroText: {
    color: "rgba(251,247,242,0.68)",
    fontFamily: fontFamily.sans,
    fontSize: 14,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  form: {
    flex: 1,
    padding: spacing.xl,
  },
  formLabel: {
    color: colors.sienna,
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    marginBottom: spacing.lg,
    textTransform: "uppercase",
  },
  switcher: {
    alignItems: "center",
    padding: spacing.lg,
  },
  switcherText: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  resetText: {
    color: colors.siennaDark,
    fontFamily: fontFamily.sansMedium,
    fontSize: 13,
  },
  securityNote: {
    backgroundColor: "rgba(181,196,177,0.14)",
    borderLeftColor: colors.sageDark,
    borderLeftWidth: 2,
    color: colors.inkLight,
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 19,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  legalConsent: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  checkbox: {
    alignItems: "center",
    borderColor: "rgba(196,169,160,0.55)",
    borderRadius: 6,
    borderWidth: 1.5,
    height: 24,
    justifyContent: "center",
    marginTop: 2,
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: colors.sienna,
    borderColor: colors.sienna,
  },
  checkboxTick: {
    color: colors.white,
    fontFamily: fontFamily.sansMedium,
    fontSize: 15,
  },
  legalConsentText: {
    color: colors.inkLight,
    flex: 1,
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 18,
  },
});
