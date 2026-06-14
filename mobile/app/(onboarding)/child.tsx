import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  DateField,
  Eyebrow,
  GlowHeader,
  Reassure,
  Text,
  TextField,
} from "../../src/components/ui";
import { colors } from "../../src/theme/tokens";
import { fonts } from "../../src/theme/typography";
import { useAuth } from "../../src/context/AuthContext";
import { createChild } from "../../src/services/children";
import { isValidChildName } from "../../src/lib/validation";
import { haptics } from "../../src/lib/haptics";
import { signOut } from "../../src/services/auth";

const AVATARS = ["🌿", "🍼", "⭐", "🌙", "🐻", "🌸", "🦋", "🌻"];

export default function OnboardingChild() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [bornAt, setBornAt] = useState<Date | null>(null);
  const [avatar, setAvatar] = useState("🌿");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = isValidChildName(name) && !submitting && !!user;

  async function onSubmit() {
    if (!user || !isValidChildName(name)) return;
    setSubmitting(true);
    setError(null);
    try {
      await createChild(user.uid, { name, bornAt, avatarEmoji: avatar });
      haptics.success();
      // Root gate routes to the dashboard once a child exists.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Try again.");
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
          <Text style={styles.moon}>✨</Text>
          <Text variant="display" color={colors.cream} style={styles.heroTitle}>
            One last{"\n"}
            <Text variant="display" italic color={colors.rose}>
              thing.
            </Text>
          </Text>
          <Text style={styles.heroPara}>
            Let&apos;s make their story feel like theirs.
          </Text>
        </GlowHeader>

        <View style={styles.form}>
          <Eyebrow>Their details</Eyebrow>
          <Text variant="heading" style={styles.question}>
            What&apos;s your{" "}
            <Text variant="heading" italic color={colors.sienna}>
              little one&apos;s
            </Text>{" "}
            name?
          </Text>

          <View style={styles.fields}>
            <TextField
              leadingEmoji="🍼"
              serif
              placeholder="e.g. Oliver…"
              autoCapitalize="words"
              autoComplete="off"
              value={name}
              onChangeText={setName}
              maxLength={40}
            />

            <View>
              <Text variant="caption" style={styles.fieldLabel}>
                When were they born? (optional)
              </Text>
              <DateField
                leadingEmoji="🎂"
                value={bornAt}
                onChange={setBornAt}
                placeholder="Add their birthday"
                maximumDate={new Date()}
              />
            </View>

            <View>
              <Text variant="caption" style={styles.fieldLabel}>
                Pick a little symbol for them
              </Text>
              <View style={styles.avatars}>
                {AVATARS.map((a) => (
                  <Pressable
                    key={a}
                    onPress={() => {
                      haptics.tap();
                      setAvatar(a);
                    }}
                    style={[
                      styles.avatar,
                      avatar === a && styles.avatarActive,
                    ]}
                  >
                    <Text style={styles.avatarEmoji}>{a}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Text variant="caption" style={styles.hint}>
            You can always change this later. This is just for us to make their
            story feel like theirs.
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

          <Pressable onPress={() => signOut()} style={styles.signout}>
            <Text variant="caption" color={colors.inkMuted}>
              Sign out
            </Text>
          </Pressable>
        </View>

        <View style={styles.reassureWrap}>
          <Reassure title="🔒 Your private space.">
            Only people you invite can ever see {name || "your baby"}&apos;s
            memories.
          </Reassure>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { backgroundColor: colors.cream, paddingBottom: 40 },
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
  fields: { gap: 20 },
  fieldLabel: { marginBottom: 8, color: colors.inkMuted },
  avatars: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
  avatarActive: { borderColor: colors.sienna, backgroundColor: colors.siennaTint },
  avatarEmoji: { fontSize: 22 },
  hint: { marginTop: 20, marginBottom: 24, lineHeight: 18, color: colors.inkMuted },
  error: { marginBottom: 16 },
  signout: { alignSelf: "center", marginTop: 16, padding: 8 },
  reassureWrap: { marginHorizontal: 24, marginTop: 28 },
});
