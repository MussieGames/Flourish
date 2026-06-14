import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Link } from "expo-router";

import {
  Button,
  Eyebrow,
  GlowHeader,
  Text,
  TextField,
} from "../../src/components/ui";
import { colors } from "../../src/theme/tokens";
import { fonts } from "../../src/theme/typography";
import { signIn, resetPassword, AuthError } from "../../src/services/auth";
import { isValidEmail } from "../../src/lib/validation";
import { haptics } from "../../src/lib/haptics";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canSubmit = isValidEmail(email) && password.length > 0 && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await signIn(email, password);
      haptics.success();
    } catch (e) {
      setError(e instanceof AuthError ? e.message : "Something went wrong.");
      haptics.warning();
    } finally {
      setSubmitting(false);
    }
  }

  async function onForgot() {
    setError(null);
    setNotice(null);
    if (!isValidEmail(email)) {
      setError("Enter your email above first, then tap reset.");
      return;
    }
    try {
      await resetPassword(email);
      setNotice("If that email has an account, a reset link is on its way.");
      haptics.success();
    } catch {
      // Avoid leaking whether the email exists.
      setNotice("If that email has an account, a reset link is on its way.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <GlowHeader style={styles.hero} glowCorner="bottom-right">
          <Text style={styles.moon}>🌿</Text>
          <Text variant="display" color={colors.cream} style={styles.heroTitle}>
            Welcome{"\n"}
            <Text variant="display" italic color={colors.rose}>
              back.
            </Text>
          </Text>
          <Text style={styles.heroPara}>
            Your little one&apos;s story is right where you left it.
          </Text>
        </GlowHeader>

        <View style={styles.form}>
          <Eyebrow>Sign in</Eyebrow>
          <View style={styles.fields}>
            <TextField
              leadingEmoji="✉️"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              leadingEmoji="🔑"
              placeholder="Your password"
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              secureTextEntry
              secureToggle
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable onPress={onForgot} style={styles.forgot} hitSlop={8}>
            <Text variant="caption" color={colors.sienna}>
              Forgot your password?
            </Text>
          </Pressable>

          {error ? (
            <Text variant="caption" color={colors.sienna} style={styles.msg}>
              {error}
            </Text>
          ) : null}
          {notice ? (
            <Text variant="caption" color={colors.sageDark} style={styles.msg}>
              {notice}
            </Text>
          ) : null}

          <Button
            label="Sign in →"
            onPress={onSubmit}
            loading={submitting}
            disabled={!canSubmit}
          />

          <Link href="/(auth)/welcome" asChild>
            <Text style={styles.skip} accessibilityRole="link">
              New here? Create an account
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { backgroundColor: colors.cream, paddingBottom: 40, minHeight: "100%" },
  hero: { paddingTop: 80, paddingBottom: 44, paddingHorizontal: 28 },
  moon: { fontSize: 36, marginBottom: 16 },
  heroTitle: { fontSize: 36, lineHeight: 40, marginBottom: 12 },
  heroPara: {
    fontFamily: fonts.sansLight,
    fontSize: 14,
    lineHeight: 24,
    color: colors.creamOn60,
  },
  form: { paddingHorizontal: 24, paddingTop: 32 },
  fields: { gap: 14, marginTop: 16 },
  forgot: { alignSelf: "flex-end", marginTop: 14, marginBottom: 8 },
  msg: { marginBottom: 16 },
  skip: {
    textAlign: "center",
    marginTop: 16,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
    textDecorationLine: "underline",
  },
});
