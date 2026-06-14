import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Eyebrow, GlowHeader, Loading, Text } from "../../src/components/ui";
import { colors, radius } from "../../src/theme/tokens";
import { fonts } from "../../src/theme/typography";
import { useChild } from "../../src/context/ChildContext";
import { useMilestones } from "../../src/hooks/useChildData";
import { useSafeArea } from "../../src/hooks/useSafeArea";
import { haptics } from "../../src/lib/haptics";
import type { Milestone } from "../../src/types";

export default function Firsts() {
  const router = useRouter();
  const { activeChild } = useChild();
  const { top } = useSafeArea();
  const { data, loading } = useMilestones(activeChild?.id);

  const captured = useMemo(
    () => data.filter((m) => m.status === "captured"),
    [data],
  );
  const upcoming = useMemo(
    () => data.filter((m) => m.status === "upcoming"),
    [data],
  );

  const firstName = activeChild?.name.split(" ")[0] ?? "your little one";

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <GlowHeader
        style={[styles.header, { paddingTop: top + 20 }]}
        glow="rgba(193,123,92,0.2)"
        glowCorner="top-right"
      >
        <Text variant="caption" color={colors.creamOn40} style={styles.eyebrow}>
          FIRSTS TRACKER
        </Text>
        <Text variant="title" color={colors.cream} style={styles.title}>
          Every little{" "}
          <Text variant="title" italic color={colors.rose}>
            first.
          </Text>
        </Text>
        <Text variant="caption" color={colors.creamOn45}>
          {captured.length} of {data.length} captured for {firstName}
        </Text>
        {data.length > 0 ? (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(captured.length / data.length) * 100}%` },
              ]}
            />
          </View>
        ) : null}
      </GlowHeader>

      {loading ? (
        <Loading label="Loading milestones…" />
      ) : (
        <>
          {upcoming.length > 0 ? (
            <View style={styles.section}>
              <Eyebrow>Coming up</Eyebrow>
              <View style={styles.list}>
                {upcoming.map((m) => (
                  <MilestoneRow
                    key={m.id}
                    milestone={m}
                    onPress={() => {
                      haptics.tap();
                      router.push(
                        `/milestone?childId=${m.childId}&milestoneId=${m.id}`,
                      );
                    }}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {captured.length > 0 ? (
            <View style={styles.section}>
              <Eyebrow color={colors.sageDark}>Captured</Eyebrow>
              <View style={styles.list}>
                {captured.map((m) => (
                  <MilestoneRow
                    key={m.id}
                    milestone={m}
                    done
                    onPress={() => {
                      haptics.tap();
                      router.push(
                        `/milestone?childId=${m.childId}&milestoneId=${m.id}`,
                      );
                    }}
                  />
                ))}
              </View>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

function MilestoneRow({
  milestone,
  done = false,
  onPress,
}: {
  milestone: Milestone;
  done?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.row, done && styles.rowDone]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.rowEmojiWrap}>
        <Text style={styles.rowEmoji}>{milestone.emoji}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{milestone.title}</Text>
        <Text style={styles.rowMeta}>
          {done ? "Captured 🎉" : `Typically ${milestone.typicalAge}`}
        </Text>
      </View>
      {done ? (
        <View style={styles.tickBadge}>
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 32 },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  eyebrow: { letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 32, lineHeight: 36, marginBottom: 6 },
  progressTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: { height: 5, backgroundColor: colors.rose, borderRadius: 999 },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  list: { marginTop: 14, gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: 14,
  },
  rowDone: {
    backgroundColor: "rgba(122,158,126,0.08)",
    borderColor: "rgba(122,158,126,0.3)",
  },
  rowEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  rowEmoji: { fontSize: 22 },
  rowInfo: { flex: 1 },
  rowTitle: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  rowMeta: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  tickBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.sageDark,
    alignItems: "center",
    justifyContent: "center",
  },
});
