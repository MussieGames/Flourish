import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Link } from "expo-router";

import {
  Button,
  Eyebrow,
  GlowHeader,
  Reassure,
  Text,
  TextField,
} from "../../src/components/ui";
import { colors, spacing } from "../../src/theme/tokens";
import { fonts } from "../../src/theme/typography";
import { signUp, AuthError } from "../../src/services/auth";
import { checkPassword, isValidEmail } from "../../src/lib/validation";
import { haptics } from "../../src/lib/haptics";
import { PasswordMeter } from "../../src/components/PasswordMeter";

export default function Welcome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = checkPassword(password);
  const canSubmit =
    isValidEmail(email) && strength.valid && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await signUp(email, password);
      haptics.success();
      // Navigation is handled by the root auth gate.
    } catch (e) {
      const message =
        e instanceof AuthError ? e.message : "Something went wrong.";
      setError(message);
      haptics.warning();
    } finally {
      setSubmitting(false);
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
        <GlowHeader style={styles.hero} glowCorner="center">
          <Text style={styles.moon}>🌿</Text>
          <Text variant="display" color={colors.cream} style={styles.heroTitle}>
            Welcome to{"\n"}
            <Text variant="display" italic color={colors.rose}>
              Flourish.
            </Text>
          </Text>
          <Text style={styles.heroPara}>
            You just did something extraordinary. And in between the feeds, the
            tears, the love that doesn&apos;t fit into words — we&apos;ll help you
            catch every moment before it slips by.
          </Text>
        </GlowHeader>

        <View style={styles.form}>
          <Eyebrow>Let&apos;s begin</Eyebrow>
          <Text variant="heading" style={styles.question}>
            Create your{" "}
            <Text variant="heading" italic color={colors.sienna}>
              private space.
            </Text>
          </Text>

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
              placeholder="Create a password"
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              secureTextEntry
              secureToggle
              value={password}
              onChangeText={setPassword}
            />
            <PasswordMeter password={password} />
          </View>

          <Text variant="caption" style={styles.hint}>
            We&apos;ll send a quick verification email so you always have a way
            back into your account.
          </Text>

          {error ? (
            <Text variant="caption" color={colors.sienna} style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button
            label="Begin their story →"
            onPress={onSubmit}
            loading={submitting}
            disabled={!canSubmit}
          />

          <Link href="/(auth)/sign-in" asChild>
            <Text style={styles.skip} accessibilityRole="link">
              I already have an account
            </Text>
          </Link>
        </View>

        <View style={styles.reassureWrap}>
          <Reassure title="🔒 This is your private space.">
            Only people you invite can see your baby&apos;s memories. We never
            share, sell, or use your data. Ever.
          </Reassure>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { backgroundColor: colors.cream, paddingBottom: 32 },
  hero: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 28 },
  moon: { fontSize: 36, marginBottom: 16 },
  heroTitle: { fontSize: 36, lineHeight: 40, marginBottom: 12 },
  heroPara: {
    fontFamily: fonts.sansLight,
    fontSize: 14,
    lineHeight: 24,
    color: colors.creamOn60,
  },
  form: { paddingHorizontal: 24, paddingTop: 32 },
  question: { fontSize: 26, marginTop: 20, marginBottom: 24 },
  fields: { gap: 14 },
  hint: {
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  error: { marginBottom: 16 },
  skip: {
    textAlign: "center",
    marginTop: 16,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkMuted,
    textDecorationLine: "underline",
  },
  reassureWrap: { marginHorizontal: 24, marginTop: 28 },
});
