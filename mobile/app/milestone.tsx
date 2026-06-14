import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Button, Loading, Text } from "../src/components/ui";
import { colors, radius } from "../src/theme/tokens";
import { fonts } from "../src/theme/typography";
import { useChild } from "../src/context/ChildContext";
import { useMilestones } from "../src/hooks/useChildData";
import { captureMilestone } from "../src/services/milestones";
import { createEvent } from "../src/services/events";
import { useAuth } from "../src/context/AuthContext";
import { MILESTONE_TEMPLATES } from "../src/data/milestoneTemplates";
import { formatLongDateTime, toDateKey } from "../src/lib/date";
import { haptics } from "../src/lib/haptics";

const CONFETTI = ["✨", "🌸", "⭐", "🌿", "💛"];

export default function MilestoneMoment() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeChild } = useChild();
  const params = useLocalSearchParams<{ childId?: string; milestoneId?: string }>();
  const childId = params.childId ?? activeChild?.id;
  const { data, loading } = useMilestones(childId);

  const milestone = useMemo(
    () => data.find((m) => m.id === params.milestoneId),
    [data, params.milestoneId],
  );

  const [busy, setBusy] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  if (loading) return <Loading dark label="Loading…" />;

  if (!milestone) {
    return (
      <View style={styles.missing}>
        <Text variant="serif" color={colors.cream}>
          We couldn&apos;t find that moment.
        </Text>
        <Button label="Go back" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const template = MILESTONE_TEMPLATES.find((t) => t.key === milestone.key);
  const captured = milestone.status === "captured";
  const childName = activeChild?.name.split(" ")[0] ?? "Your little one";

  async function onCapture() {
    if (!user || !childId || !milestone) return;
    setBusy(true);
    try {
      await captureMilestone(childId, milestone.id);
      await createEvent(user.uid, childId, {
        type: "milestone",
        title: milestone.title,
        meta: "Milestone captured",
        date: toDateKey(new Date()),
      }).catch(() => {});
      haptics.success();
    } finally {
      setBusy(false);
    }
  }

  async function onShare() {
    if (!milestone) return;
    haptics.tap();
    await Share.share({
      message: `${childName} just reached a milestone: ${milestone.title}! 🎉 — shared from Flourish`,
    }).catch(() => {});
  }

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={["rgba(193,123,92,0.25)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.orb}
        pointerEvents="none"
      />
      <Pressable
        style={styles.close}
        onPress={() => router.back()}
        hitSlop={12}
      >
        <Ionicons name="close" size={26} color={colors.creamOn60} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.confetti}>
          {CONFETTI.map((c, i) => (
            <Text key={i} style={[styles.confItem, { opacity: 0.6 }]}>
              {c}
            </Text>
          ))}
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {captured ? "First captured" : "A first is here"}
          </Text>
        </View>

        <Animated.Text
          style={[styles.emoji, { transform: [{ scale: pulse }] }]}
        >
          {milestone.emoji}
        </Animated.Text>

        <Text variant="display" color={colors.cream} center style={styles.title}>
          {childName}&apos;s{"\n"}
          <Text variant="display" italic color={colors.rose}>
            {milestone.title}
          </Text>
        </Text>

        <Text variant="caption" color={colors.creamOn40} center style={styles.date}>
          {captured && milestone.capturedAt
            ? formatLongDateTime(milestone.capturedAt)
            : `Typically around ${milestone.typicalAge}`}
        </Text>

        <Text style={styles.para}>
          {template?.celebration ??
            "A beautiful new moment in their story. One you'll never forget."}
        </Text>

        <View style={styles.actions}>
          {captured ? (
            <>
              <Button
                label="📸 Add a photo of this moment"
                onPress={() => router.replace("/capture?kind=photo")}
              />
              <Button
                label="Back to firsts →"
                variant="secondary"
                onPress={() => router.back()}
              />
            </>
          ) : (
            <>
              <Button
                label="🎉 Mark this as captured"
                onPress={onCapture}
                loading={busy}
              />
              <Button
                label="Not yet"
                variant="secondary"
                onPress={() => router.back()}
              />
            </>
          )}
        </View>

        {captured ? (
          <View style={styles.shareRow}>
            <ShareIcon icon="people" onPress={onShare} />
            <ShareIcon icon="mail" onPress={onShare} />
            <ShareIcon icon="share-social" onPress={onShare} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ShareIcon({
  icon,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.shareIcon} onPress={onPress}>
      <Ionicons name={icon} size={18} color={colors.creamOn65} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ink },
  orb: { position: "absolute", top: -80, left: -80, width: 400, height: 400, borderRadius: 200 },
  close: { position: "absolute", top: 56, right: 24, zIndex: 10 },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 80,
  },
  confetti: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 12,
  },
  confItem: { fontSize: 20 },
  badge: {
    backgroundColor: colors.sienna,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: radius.sm,
    marginBottom: 24,
  },
  badgeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.white,
  },
  emoji: { fontSize: 72, marginBottom: 20 },
  title: { fontSize: 40, lineHeight: 44, marginBottom: 12 },
  date: { letterSpacing: 1, marginBottom: 28 },
  para: {
    fontFamily: fonts.sansLight,
    fontSize: 15,
    lineHeight: 26,
    color: colors.creamOn65,
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 36,
  },
  actions: { width: "100%", gap: 10 },
  shareRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  shareIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  missing: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
});
