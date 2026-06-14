import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Button, Eyebrow, GlowHeader, Text } from "../src/components/ui";
import { colors, radius } from "../src/theme/tokens";
import { fonts } from "../src/theme/typography";
import { useAuth } from "../src/context/AuthContext";
import { useSafeArea } from "../src/hooks/useSafeArea";
import { haptics } from "../src/lib/haptics";
import type { PlanTier } from "../src/types";

const CURRENT_FEATURES = [
  "500 photos & videos",
  "25 milestones tracked",
  "Basic scrapbook layouts",
  "Share with 2 family members",
];
const BLOOM_FEATURES = [
  "Unlimited photos & videos",
  "All 200+ milestones",
  "Premium scrapbook layouts",
  "Share with 10 family members",
  "Yearly video montage",
  "Printed book discounts",
];
const HEIRLOOM_FEATURES = [
  "1 printed hardcover scrapbook",
  "12 months of Bloom included",
  "Shipped to your door",
  "No subscription started",
  "Perfect baby shower gift",
];

export default function Plan() {
  const router = useRouter();
  const { profile } = useAuth();
  const { top } = useSafeArea();
  const plan: PlanTier = profile?.plan ?? "seedling";

  function startCheckout(tier: string) {
    haptics.tap();
    // Real payments require a server-verified purchase flow (RevenueCat / Stripe
    // + a Cloud Function that updates `users/{uid}.plan`). Clients can never set
    // their own plan — the security rules forbid it (see firestore.rules).
    Alert.alert(
      "Secure checkout",
      `Purchasing ${tier} happens through the App Store / Play Store. ` +
        "Your plan is then activated server-side after the receipt is verified — " +
        "never by the app itself.",
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlowHeader
          style={[styles.header, { paddingTop: top + 16 }]}
          glow="rgba(201,169,110,0.16)"
          glowCorner="top-right"
        >
          <Pressable style={styles.close} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.creamOn60} />
          </Pressable>
          <Text variant="caption" color={colors.gold} style={styles.label}>
            YOUR PLAN
          </Text>
          <Text variant="title" color={colors.cream} style={styles.title}>
            Simple,{"\n"}
            <Text variant="title" italic color={colors.gold}>
              honest
            </Text>{" "}
            pricing.
          </Text>
          <Text variant="caption" color={colors.creamOn40}>
            No surprises. No selling your data. Just Flourish.
          </Text>
        </GlowHeader>

        <LinearGradient
          colors={[colors.ink, "#3D2820"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.currentPlan}
        >
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>
              {plan === "seedling" ? "Current plan" : "Free tier"}
            </Text>
          </View>
          <Text variant="heading" color={colors.cream} style={styles.currentName}>
            Seedling
          </Text>
          <Text variant="caption" color={colors.creamOn40} style={styles.currentPrice}>
            Free forever
          </Text>
          {CURRENT_FEATURES.map((f) => (
            <Feature key={f} text={f} color={colors.gold} textColor={colors.creamOn65} />
          ))}
        </LinearGradient>

        <View style={styles.cards}>
          <View style={[styles.card, styles.cardRec]}>
            <View style={styles.recBadge}>
              <Text style={styles.recBadgeText}>Most loved</Text>
            </View>
            <View style={styles.cardTop}>
              <Text variant="serif" style={styles.cardName}>
                Bloom
              </Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text variant="title" style={styles.cardPrice}>
                  $8
                </Text>
                <Text style={styles.cardPeriod}>per month · billed monthly</Text>
              </View>
            </View>
            {BLOOM_FEATURES.map((f) => (
              <Feature key={f} text={f} color={colors.sageDark} textColor={colors.inkLight} />
            ))}
            <Button
              label={plan === "bloom" ? "Your current plan" : "Upgrade to Bloom"}
              onPress={() => startCheckout("Bloom")}
              disabled={plan === "bloom"}
              style={styles.cardBtn}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text variant="serif" style={styles.cardName}>
                Heirloom
              </Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text variant="title" style={styles.cardPrice}>
                  $79
                </Text>
                <Text style={styles.cardPeriod}>one-time · gift</Text>
              </View>
            </View>
            <View style={styles.clarity}>
              <Text style={styles.clarityLabel}>WHAT&apos;S INCLUDED IN $79</Text>
              <Text style={styles.clarityText}>
                One printed hardcover book{" "}
                <Text style={styles.clarityBold}>+</Text> 12 months of Bloom
                access — paid once, nothing more. After 12 months, choose to
                continue Bloom at $8/month or stay on the free Seedling plan. The
                book is yours to keep forever either way.
              </Text>
            </View>
            {HEIRLOOM_FEATURES.map((f) => (
              <Feature key={f} text={f} color={colors.sageDark} textColor={colors.inkLight} />
            ))}
            <Button
              label="Buy as a gift"
              variant="outline"
              onPress={() => startCheckout("Heirloom")}
              style={styles.cardBtn}
            />
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            <Text style={styles.noteBold}>🔒 Our promise: </Text>
            Upgrading never changes what we do with your data. Zero ads. Zero
            data sharing. Always. Cancel Bloom any time — no questions asked.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Feature({
  text,
  color,
  textColor,
}: {
  text: string;
  color: string;
  textColor: string;
}) {
  return (
    <View style={styles.feat}>
      <Ionicons name="checkmark" size={13} color={color} />
      <Text style={[styles.featText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingBottom: 28 },
  close: { position: "absolute", top: 16, right: 24, zIndex: 5 },
  label: { letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 32, lineHeight: 36, marginBottom: 6 },
  currentPlan: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: radius.md,
    padding: 22,
  },
  currentBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 12,
  },
  currentBadgeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.ink,
  },
  currentName: { color: colors.cream, marginBottom: 4 },
  currentPrice: { marginBottom: 16 },
  cards: { padding: 20, gap: 16 },
  card: {
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: 20,
    paddingTop: 22,
  },
  cardRec: { borderColor: colors.sienna },
  recBadge: {
    position: "absolute",
    top: -10,
    left: 20,
    backgroundColor: colors.sienna,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  recBadgeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.white,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardName: { fontSize: 22 },
  cardPrice: { fontSize: 28 },
  cardPeriod: { fontFamily: fonts.sans, fontSize: 10, color: colors.inkMuted },
  feat: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  featText: { fontFamily: fonts.sans, fontSize: 12, flex: 1 },
  cardBtn: { marginTop: 12 },
  clarity: {
    backgroundColor: "rgba(201,169,110,0.1)",
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.3)",
    padding: 12,
    marginBottom: 12,
  },
  clarityLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.gold,
    marginBottom: 4,
  },
  clarityText: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 18, color: colors.inkLight },
  clarityBold: { fontFamily: fonts.sansMedium, color: colors.ink },
  note: {
    marginHorizontal: 20,
    padding: 14,
    backgroundColor: "rgba(181,196,177,0.12)",
    borderLeftWidth: 2,
    borderLeftColor: colors.sageDark,
  },
  noteText: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 19, color: colors.inkLight },
  noteBold: { fontFamily: fonts.sansMedium, color: colors.sageDark },
});
