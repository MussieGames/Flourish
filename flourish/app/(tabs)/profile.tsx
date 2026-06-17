/**
 * Profile + Plan page — personalised for the current user and baby.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useBabyContext } from '../../src/contexts/BabyContext';
import { getSubscription } from '../../src/services/firestore';
import { useToast } from '../../src/hooks/useToast';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import type { PlanId, Subscription } from '../../src/types';

// Plan metadata
const PLAN_LIMITS: Record<PlanId, { photos: number | null; label: string }> = {
  seedling: { photos: 500, label: 'Free forever' },
  bloom: { photos: null, label: '$8 / month' },
  heirloom: { photos: null, label: '$79 one-time' },
};

const PLAN_CARDS = [
  {
    id: 'bloom' as PlanId,
    name: 'Bloom',
    price: '$8',
    period: 'per month · billed monthly',
    recommended: true,
    features: [
      'Unlimited photos & videos',
      'All 200+ milestones',
      'Premium scrapbook layouts',
      'Share with 10 family members',
      'Yearly video montage',
      'Printed book discounts',
    ],
  },
  {
    id: 'heirloom' as PlanId,
    name: 'Heirloom',
    price: '$79',
    period: 'one-time · gift',
    recommended: false,
    features: [
      '1 printed hardcover scrapbook',
      '12 months of Bloom included',
      'Shipped to your door',
      'No subscription started',
      'Perfect baby shower gift',
    ],
    clarityNote:
      'One printed hardcover book + 12 months of Bloom access — paid once, nothing more. The book is yours to keep forever.',
  },
];

// Personalised header copy based on current plan
function getPlanHeaderCopy(
  planId: PlanId,
  babyName: string | null
): { eyebrow: string; title: string; sub: string } {
  const name = babyName ?? 'Your little one';
  switch (planId) {
    case 'seedling':
      return {
        eyebrow: 'YOUR PLAN',
        title: "You're on Seedling.",
        sub: `${name} has 500 photos waiting to be captured. Upgrade to keep them all.`,
      };
    case 'bloom':
      return {
        eyebrow: 'YOUR PLAN',
        title: "You're on Bloom.",
        sub: `Unlimited memories for ${name}. Every moment is safe.`,
      };
    case 'heirloom':
      return {
        eyebrow: 'YOUR PLAN',
        title: "You have Heirloom.",
        sub: `${name}'s scrapbook will arrive at your door. Bloom access included.`,
      };
  }
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeBaby } = useBabyContext();
  const { showToast, ToastView } = useToast();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getSubscription(user.uid).then(setSubscription).catch(() => {});
    }
  }, [user?.uid]);

  const currentPlanId: PlanId = subscription?.planId ?? 'seedling';
  const headerCopy = getPlanHeaderCopy(currentPlanId, activeBaby?.name ?? null);

  const handleLogout = () => {
    // In a real app we'd show a confirm dialog — here we use our own Toast pattern
    // For destructive actions we still use Alert to get native confirmation
    logout();
  };

  const handleSelectPlan = (planName: string) => {
    showToast(`Coming soon`, `${planName} will be available when billing is live.`);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Personalised plan header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <LinearGradient
            colors={['rgba(201,169,110,0.18)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <Text style={styles.planEyebrow}>{headerCopy.eyebrow}</Text>
          <Text style={styles.title}>
            <Text style={styles.titleItalic}>{headerCopy.title}</Text>
          </Text>
          <Text style={styles.sub}>{headerCopy.sub}</Text>
        </View>

        {/* Current plan card */}
        <View style={styles.currentPlan}>
          <LinearGradient
            colors={[Colors.ink, '#3D2820']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
          </View>
          <Text style={styles.currentName}>
            {currentPlanId.charAt(0).toUpperCase() + currentPlanId.slice(1)}
          </Text>
          <Text style={styles.currentPrice}>{PLAN_LIMITS[currentPlanId].label}</Text>
          <View style={styles.currentFeatures}>
            {[
              '500 photos & videos',
              '25 milestones tracked',
              'Basic scrapbook layouts',
              'Share with 2 family members',
            ].map((feat) => (
              <View key={feat} style={styles.featRow}>
                <Text style={styles.featCheck}>✓</Text>
                <Text style={styles.featText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upgrade cards */}
        <View style={styles.planCards}>
          {PLAN_CARDS.map((plan) => (
            <View key={plan.id} style={[styles.planCard, plan.recommended && styles.planCardRec]}>
              {plan.recommended && (
                <View style={styles.recBadge}>
                  <Text style={styles.recBadgeText}>MOST LOVED</Text>
                </View>
              )}
              <View style={styles.planTop}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
              </View>

              {plan.clarityNote && (
                <View style={styles.clarityBox}>
                  <Text style={styles.clarityTitle}>WHAT'S INCLUDED</Text>
                  <Text style={styles.clarityText}>{plan.clarityNote}</Text>
                </View>
              )}

              <View style={styles.planFeatures}>
                {plan.features.map((feat) => (
                  <View key={feat} style={styles.featRow}>
                    <Text style={[styles.featCheck, { color: Colors.sageDark }]}>✓</Text>
                    <Text style={[styles.featText, { color: Colors.inkLight }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.planBtn, plan.recommended ? styles.planBtnFilled : styles.planBtnOutline]}
                onPress={() => handleSelectPlan(plan.name)}
                activeOpacity={0.85}
              >
                <Text style={[styles.planBtnText, !plan.recommended && styles.planBtnTextOutline]}>
                  {plan.id === 'heirloom' ? 'BUY AS A GIFT' : `UPGRADE TO ${plan.name.toUpperCase()}`}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            <Text style={styles.privacyStrong}>🔒 Our promise: </Text>
            Upgrading never changes what we do with your data. Zero ads. Zero data sharing. Always.
            Cancel Bloom any time — no questions asked.
          </Text>
        </View>

        {/* Account */}
        <View style={styles.accountSection}>
          <EyebrowLabel>Account</EyebrowLabel>

          <View style={styles.accountCard}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue} numberOfLines={1}>{user?.email ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Email verified</Text>
              <Text style={[styles.accountValue, { color: user?.emailVerified ? Colors.sageDark : Colors.sienna }]}>
                {user?.emailVerified ? '✓ Verified' : '✗ Unverified'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Milestone notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ true: Colors.sageDark, false: 'rgba(196,169,160,0.4)' }}
                thumbColor={Colors.cream}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {ToastView}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },

  header: {
    backgroundColor: Colors.ink, paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'], overflow: 'hidden',
  },
  planEyebrow: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs,
    letterSpacing: 2, color: Colors.gold, marginBottom: 8,
  },
  title: {
    fontFamily: 'CormorantGaramond_300Light', fontSize: 32,
    color: Colors.cream, lineHeight: 38, marginBottom: 6,
  },
  titleItalic: { fontFamily: 'CormorantGaramond_300Light_Italic' },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm, color: 'rgba(251,247,242,0.55)', lineHeight: 20 },

  currentPlan: {
    margin: Spacing.xl, padding: Spacing['2xl'],
    overflow: 'hidden', position: 'relative',
  },
  currentBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.gold,
    paddingVertical: 3, paddingHorizontal: 10, marginBottom: 12,
  },
  currentBadgeText: { fontFamily: 'DMSans_500Medium', fontSize: 8, letterSpacing: 1.2, color: Colors.ink },
  currentName: { fontFamily: 'CormorantGaramond_300Light', fontSize: 28, color: Colors.cream, marginBottom: 4 },
  currentPrice: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm, color: 'rgba(251,247,242,0.4)', marginBottom: 16 },
  currentFeatures: { gap: 8 },

  featRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  featCheck: { color: Colors.gold, fontSize: 12 },
  featText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: 'rgba(251,247,242,0.65)' },

  planCards: { paddingHorizontal: Spacing.xl, gap: 12 },
  planCard: {
    backgroundColor: Colors.warm, borderWidth: 1.5, borderColor: 'rgba(196,169,160,0.25)',
    padding: Spacing['2xl'], position: 'relative', marginTop: 10,
  },
  planCardRec: { borderColor: Colors.sienna },
  recBadge: { position: 'absolute', top: -10, left: 20, backgroundColor: Colors.sienna, paddingVertical: 3, paddingHorizontal: 10 },
  recBadgeText: { fontFamily: 'DMSans_500Medium', fontSize: 8, letterSpacing: 1, color: '#fff' },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  planName: { fontFamily: 'CormorantGaramond_300Light', fontSize: 22, color: Colors.ink },
  planPrice: { fontFamily: 'CormorantGaramond_300Light', fontSize: 28, color: Colors.ink, textAlign: 'right' },
  planPeriod: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.inkMedium, textAlign: 'right' },

  clarityBox: {
    backgroundColor: 'rgba(201,169,110,0.1)', borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.3)', padding: 12, marginBottom: 12,
  },
  clarityTitle: { fontFamily: 'DMSans_500Medium', fontSize: 9, letterSpacing: 1, color: Colors.gold, marginBottom: 4 },
  clarityText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.inkLight, lineHeight: 18 },

  planFeatures: { gap: 7, marginBottom: 16 },
  planBtn: { padding: 14, alignItems: 'center', borderRadius: 2 },
  planBtnFilled: { backgroundColor: Colors.sienna },
  planBtnOutline: { borderWidth: 1, borderColor: 'rgba(196,169,160,0.4)', backgroundColor: 'transparent' },
  planBtnText: { fontFamily: 'DMSans_400Regular', fontSize: 11, letterSpacing: 1, color: '#fff' },
  planBtnTextOutline: { color: Colors.inkLight },

  privacyNote: {
    margin: Spacing.xl, padding: Spacing.mdPlus, paddingLeft: 16,
    backgroundColor: 'rgba(181,196,177,0.12)', borderLeftWidth: 2, borderLeftColor: Colors.sageDark,
  },
  privacyText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.inkLight, lineHeight: 20 },
  privacyStrong: { fontFamily: 'DMSans_500Medium', color: Colors.sageDark },

  accountSection: { padding: Spacing.xl, paddingBottom: Spacing['2xl'] },
  accountCard: {
    backgroundColor: Colors.warm, borderWidth: 1, borderColor: 'rgba(196,169,160,0.2)',
    borderRadius: 4, marginBottom: Spacing.xl, overflow: 'hidden',
  },
  accountRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  accountLabel: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm, color: Colors.inkMedium },
  accountValue: { fontFamily: 'DMSans_500Medium', fontSize: Typography.sizes.sm, color: Colors.ink, maxWidth: 200 },
  divider: { height: 1, backgroundColor: 'rgba(196,169,160,0.15)' },
  signOutBtn: {
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(196,169,160,0.3)', borderRadius: 2,
  },
  signOutText: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm,
    letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.sienna,
  },
});
