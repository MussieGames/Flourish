import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Card,
  Eyebrow,
  GlowHeader,
  Loading,
  Text,
} from "../../src/components/ui";
import { AssetImage } from "../../src/components/AssetImage";
import { colors, radius } from "../../src/theme/tokens";
import { fonts } from "../../src/theme/typography";
import { useAuth } from "../../src/context/AuthContext";
import { useChild } from "../../src/context/ChildContext";
import { useMemories, useMilestones } from "../../src/hooks/useChildData";
import { computeAge, formatShortDate, greeting } from "../../src/lib/date";
import { haptics } from "../../src/lib/haptics";
import { useSafeArea } from "../../src/hooks/useSafeArea";

const MEM_GRADIENTS: [string, string][] = [
  ["#E8C4B0", "#C4907A"],
  ["#C5D4C0", "#A8BFA8"],
  ["#E8D5B0", "#D4B880"],
  ["#D4C4D8", "#B4A0C0"],
];

export default function Dashboard() {
  const router = useRouter();
  const { profile } = useAuth();
  const { activeChild } = useChild();
  const { top } = useSafeArea();

  const childId = activeChild?.id;
  const memories = useMemories(childId, 6);
  const milestones = useMilestones(childId);

  const age = useMemo(
    () => computeAge(activeChild?.bornAt),
    [activeChild?.bornAt],
  );

  const nextMilestone = useMemo(
    () => milestones.data.find((m) => m.status === "upcoming"),
    [milestones.data],
  );

  if (!activeChild) {
    return <Loading label="Loading your space…" />;
  }

  const firstName = activeChild.name.split(" ")[0] || activeChild.name;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <GlowHeader
        style={[styles.header, { paddingTop: top + 20 }]}
        glowCorner="bottom-right"
      >
        <Text variant="caption" color={colors.creamOn40} style={styles.greeting}>
          {greeting().toUpperCase()}
        </Text>
        <Text variant="title" color={colors.cream} style={styles.name}>
          {firstName}&apos;s{" "}
          <Text variant="title" italic color={colors.rose}>
            World
          </Text>
        </Text>
        <Text variant="caption" color={colors.creamOn45}>
          {age ? `${age.label}` : "Add a birthday in Profile"}
          {activeChild.bornAt
            ? ` · Born ${formatShortDate(activeChild.bornAt)}`
            : ""}
        </Text>
      </GlowHeader>

      {nextMilestone ? (
        <Pressable
          style={styles.alert}
          onPress={() => {
            haptics.tap();
            router.push("/(tabs)/firsts");
          }}
        >
          <Text style={styles.alertIcon}>⭐</Text>
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>
              {nextMilestone.title} is coming
            </Text>
            <Text style={styles.alertSub}>
              Typically around {nextMilestone.typicalAge}. Keep your camera
              ready.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>
      ) : null}

      <View style={styles.section}>
        <Eyebrow>Capture a moment</Eyebrow>
        <View style={styles.quickRow}>
          <QuickButton
            icon="📸"
            label="Photo"
            highlighted
            onPress={() =>
              router.push({ pathname: "/capture", params: { kind: "photo" } })
            }
          />
          <QuickButton
            icon="🎥"
            label="Video"
            onPress={() =>
              router.push({ pathname: "/capture", params: { kind: "video" } })
            }
          />
          <QuickButton
            icon="✍️"
            label="Journal"
            onPress={() =>
              router.push({ pathname: "/(tabs)/journal", params: { compose: "1" } })
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Eyebrow>Recent memories</Eyebrow>
        {memories.loading ? (
          <Loading />
        ) : memories.data.length === 0 ? (
          <Card soft style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text variant="serif" center>
              No memories yet.
            </Text>
            <Text variant="bodyMuted" center style={styles.emptyText}>
              Tap a capture button above to save your first one.
            </Text>
          </Card>
        ) : (
          <View style={styles.grid}>
            {memories.data.map((m, i) => (
              <Pressable
                key={m.id}
                style={styles.memCard}
                onPress={() => {
                  haptics.tap();
                  router.push("/(tabs)/journal");
                }}
              >
                <View style={styles.memPhotoWrap}>
                  <AssetImage
                    storagePath={m.storagePath}
                    fallbackEmoji={emojiForKind(m.kind)}
                    gradient={MEM_GRADIENTS[i % MEM_GRADIENTS.length]}
                    style={styles.memPhoto}
                  />
                </View>
                <View style={styles.memMeta}>
                  <Text style={styles.memTitle} numberOfLines={1}>
                    {m.title}
                  </Text>
                  <Text style={styles.memDate}>
                    {formatShortDate(m.takenAt ?? m.createdAt)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Eyebrow>Firsts tracker</Eyebrow>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {milestones.data.slice(0, 8).map((m) => {
            const done = m.status === "captured";
            return (
              <Pressable
                key={m.id}
                style={[styles.chip, done && styles.chipDone]}
                onPress={() => {
                  haptics.tap();
                  router.push("/(tabs)/firsts");
                }}
              >
                <Text style={styles.chipEmoji}>{m.emoji}</Text>
                <View>
                  <Text style={styles.chipName}>{m.title}</Text>
                  <Text style={styles.chipAge}>{m.typicalAge}</Text>
                </View>
                {done ? <Text style={styles.chipTick}>✓</Text> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function emojiForKind(kind: string): string {
  if (kind === "video") return "🎥";
  if (kind === "journal") return "✍️";
  return "📸";
}

function QuickButton({
  icon,
  label,
  onPress,
  highlighted = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  highlighted?: boolean;
}) {
  return (
    <Pressable
      style={[styles.qc, highlighted && styles.qcHi]}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
    >
      <Text style={styles.qcIcon}>{icon}</Text>
      <Text style={styles.qcLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 32 },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  greeting: { letterSpacing: 1.2, marginBottom: 6 },
  name: { fontSize: 32, lineHeight: 36, marginBottom: 4 },
  alert: {
    marginHorizontal: 20,
    marginTop: -1,
    backgroundColor: colors.sienna,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.sm,
  },
  alertIcon: { fontSize: 20 },
  alertText: { flex: 1 },
  alertTitle: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.white },
  alertSub: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  quickRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  qc: {
    flex: 1,
    paddingVertical: 18,
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.sm,
    alignItems: "center",
    gap: 6,
  },
  qcHi: { borderColor: "rgba(193,123,92,0.3)" },
  qcIcon: { fontSize: 22 },
  qcLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.inkLight,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  memCard: {
    width: "48.5%",
    backgroundColor: colors.warm,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...{
      shadowColor: "#2C2420",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
  },
  memPhotoWrap: { height: 90 },
  memPhoto: { width: "100%", height: 90 },
  memMeta: { paddingVertical: 10, paddingHorizontal: 12 },
  memTitle: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink },
  memDate: { fontFamily: fonts.sans, fontSize: 10, color: colors.inkMuted, marginTop: 2 },
  empty: { marginTop: 16, padding: 28, alignItems: "center", gap: 6 },
  emptyEmoji: { fontSize: 32, marginBottom: 4 },
  emptyText: { marginTop: 2 },
  chipRow: { gap: 10, marginTop: 16, paddingRight: 20 },
  chip: {
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipDone: {
    backgroundColor: "rgba(122,158,126,0.1)",
    borderColor: "rgba(122,158,126,0.3)",
  },
  chipEmoji: { fontSize: 18 },
  chipName: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.ink },
  chipAge: { fontFamily: fonts.sans, fontSize: 9, color: colors.inkMuted },
  chipTick: { fontSize: 14, color: colors.sageDark, marginLeft: 4 },
});
