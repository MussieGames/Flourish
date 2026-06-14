import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Card, Eyebrow, GlowHeader, Reassure, Text } from "../../src/components/ui";
import { colors, radius } from "../../src/theme/tokens";
import { fonts } from "../../src/theme/typography";
import { useAuth } from "../../src/context/AuthContext";
import { useChild } from "../../src/context/ChildContext";
import { computeAge } from "../../src/lib/date";
import { signOut, resendVerification } from "../../src/services/auth";
import { useSafeArea } from "../../src/hooks/useSafeArea";
import { haptics } from "../../src/lib/haptics";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export default function Profile() {
  const router = useRouter();
  const { user, profile, emailVerified } = useAuth();
  const { children, activeChild, selectChild } = useChild();
  const { top } = useSafeArea();
  const [resent, setResent] = useState(false);

  const age = computeAge(activeChild?.bornAt);

  async function onResend() {
    try {
      await resendVerification();
      setResent(true);
      haptics.success();
    } catch {
      Alert.alert("Couldn't send", "Please try again in a moment.");
    }
  }

  function confirmSignOut() {
    Alert.alert("Sign out", "You can always sign back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut() },
    ]);
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <GlowHeader
        style={[styles.header, { paddingTop: top + 20 }]}
        glowCorner="top-right"
      >
        <Text style={styles.avatar}>{activeChild?.avatarEmoji ?? "🌿"}</Text>
        <Text variant="title" color={colors.cream} style={styles.name}>
          {activeChild?.name ?? "Your little one"}
        </Text>
        <Text variant="caption" color={colors.creamOn45}>
          {age ? age.label : "Add a birthday below"}
        </Text>
      </GlowHeader>

      {!emailVerified ? (
        <Pressable style={styles.verifyBanner} onPress={onResend}>
          <Ionicons name="mail-unread-outline" size={18} color={colors.white} />
          <Text style={styles.verifyText}>
            {resent
              ? "Verification email sent — check your inbox."
              : "Verify your email to secure your account. Tap to resend."}
          </Text>
        </Pressable>
      ) : null}

      {children.length > 1 ? (
        <View style={styles.section}>
          <Eyebrow>Your children</Eyebrow>
          <View style={styles.childRow}>
            {children.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  haptics.tap();
                  selectChild(c.id);
                }}
                style={[
                  styles.childChip,
                  c.id === activeChild?.id && styles.childChipActive,
                ]}
              >
                <Text style={styles.childEmoji}>{c.avatarEmoji ?? "🌿"}</Text>
                <Text variant="caption" color={colors.ink}>
                  {c.name.split(" ")[0]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Eyebrow>Features</Eyebrow>
        <Card soft style={styles.menu}>
          <Row
            icon="sparkles-outline"
            label="Stickers"
            sub="Age-adaptive decorations"
            onPress={() => router.push("/stickers")}
          />
          <Divider />
          <Row
            icon="diamond-outline"
            label="Plans & pricing"
            sub={`You're on ${capitalize(profile?.plan ?? "seedling")}`}
            onPress={() => router.push("/plan")}
          />
          <Divider />
          <Row
            icon="camera-outline"
            label="Capture a memory"
            sub="Photo or video"
            onPress={() =>
              router.push({ pathname: "/capture", params: { kind: "photo" } })
            }
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Eyebrow>Account</Eyebrow>
        <Card soft style={styles.menu}>
          <Row icon="person-outline" label={user?.email ?? ""} sub="Signed in" />
          <Divider />
          <Row
            icon={emailVerified ? "shield-checkmark-outline" : "shield-outline"}
            label="Email verification"
            sub={emailVerified ? "Verified" : "Not verified — tap to resend"}
            onPress={emailVerified ? undefined : onResend}
          />
          <Divider />
          <Row
            icon="log-out-outline"
            label="Sign out"
            danger
            onPress={confirmSignOut}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Reassure title="🔒 Your data stays yours.">
          Everything is end-to-end protected by Firebase security rules. Only you
          and the family members you invite can ever see these memories. We never
          sell or share your data.
        </Reassure>
      </View>

      <Text variant="caption" color={colors.inkMuted} center style={styles.version}>
        Flourish · made for 3am
      </Text>
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  sub,
  onPress,
  danger = false,
}: {
  icon: IoniconName;
  label: string;
  sub?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={styles.row}
      onPress={
        onPress
          ? () => {
              haptics.tap();
              onPress();
            }
          : undefined
      }
      disabled={!onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? colors.sienna : colors.inkLight}
      />
      <View style={styles.rowText}>
        <Text
          style={[styles.rowLabel, danger && { color: colors.sienna }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {onPress && !danger ? (
        <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
      ) : null}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingBottom: 28, alignItems: "flex-start" },
  avatar: { fontSize: 40, marginBottom: 12 },
  name: { fontSize: 30, marginBottom: 4 },
  verifyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: -1,
    backgroundColor: colors.sienna,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
  },
  verifyText: { flex: 1, fontFamily: fonts.sans, fontSize: 12, color: colors.white },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  childRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  childChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  childChipActive: { borderColor: colors.sienna, backgroundColor: colors.siennaTint },
  childEmoji: { fontSize: 18 },
  menu: { marginTop: 14, paddingHorizontal: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16 },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  rowSub: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline },
  version: { marginTop: 28 },
});
