/**
 * Profile + Plan page.
 * Monthly/Annual toggle on the Bloom upgrade card.
 * Heirloom overlap explanation shown before purchase.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { trackUpgradeScreenViewed, trackUpgradeTapped, trackSignedOut } from '../../src/services/analytics';
import { useBabyContext } from '../../src/contexts/BabyContext';
import { getSubscription } from '../../src/services/firestore';
import { useToast } from '../../src/hooks/useToast';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import type { BillingCycle, PlanId, Subscription } from '../../src/types';
import {
  bloomStatusLabel,
  heirloomOverlapExplanation,
  hasActiveBloom,
} from '../../src/utils/subscription';

// ─── Billing toggle component ─────────────────────────────────────────────────
function BillingToggle({
  cycle,
  onChange,
}: {
  cycle: BillingCycle;
  onChange: (c: BillingCycle) => void;
}) {
  return (
    <View style={toggle.container}>
      <TouchableOpacity
        style={[toggle.option, cycle === 'monthly' && toggle.optionActive]}
        onPress={() => onChange('monthly')}
        activeOpacity={0.8}
      >
        <Text style={[toggle.label, cycle === 'monthly' && toggle.labelActive]}>Monthly</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[toggle.option, cycle === 'annual' && toggle.optionActive]}
        onPress={() => onChange('annual')}
        activeOpacity={0.8}
      >
        <Text style={[toggle.label, cycle === 'annual' && toggle.labelActive]}>Annual</Text>
        {/* Savings badge — only shown on the annual option */}
        <View style={toggle.savingsBadge}>
          <Text style={toggle.savingsText}>Save $27</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const toggle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(196,169,160,0.15)',
    borderRadius: 8,
    padding: 3,
    marginBottom: Spacing['2xl'],
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  optionActive: {
    backgroundColor: Colors.warm,
    shadowColor: '#2C2420',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.inkMedium,
  },
  labelActive: {
    fontFamily: 'DMSans_500Medium',
    color: Colors.ink,
  },
  savingsBadge: {
    backgroundColor: Colors.sageDark,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  savingsText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 8,
    letterSpacing: 0.3,
    color: '#fff',
  },
});

// ─── Plan header copy ─────────────────────────────────────────────────────────
function getPlanHeaderCopy(
  planId: PlanId,
  sub: Subscription | null,
  babyName: string | null
): { eyebrow: string; title: string; sub: string } {
  const name = babyName ?? 'your little one';
  const status = sub ? bloomStatusLabel(sub) : null;

  switch (planId) {
    case 'seedling':
      return {
        eyebrow: 'YOUR PLAN',
        title: "You're on Seedling.",
        sub: `${name.charAt(0).toUpperCase() + name.slice(1)}'s story has 200 photos to fill. Upgrade to Bloom to capture it all.`,
      };
    case 'bloom':
      return {
        eyebrow: 'YOUR PLAN',
        title: "You're on Bloom.",
        sub: status
          ? `Unlimited memories for ${name}. ${status}.`
          : `Unlimited memories for ${name}.`,
      };
    case 'heirloom':
      return {
        eyebrow: 'YOUR PLAN',
        title: 'You have Heirloom.',
        sub: `${name.charAt(0).toUpperCase() + name.slice(1)}'s scrapbook will arrive at your door. ${status ?? ''}.`.trim(),
      };
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeBaby } = useBabyContext();
  const { showToast, ToastView } = useToast();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getSubscription(user.uid).then(setSubscription).catch(() => {});
    }
  }, [user?.uid]);

  const currentPlanId: PlanId = subscription?.planId ?? 'seedling';
  const headerCopy = getPlanHeaderCopy(currentPlanId, subscription, activeBaby?.name ?? null);
  const isCurrentlyBloom = hasActiveBloom(subscription);

  // Heirloom overlap explanation — surfaced before the user taps "Buy"
  const heirloomNote = heirloomOverlapExplanation(subscription);

  const bloomPrice = billingCycle === 'monthly' ? '$8' : '$69';
  const bloomPeriod = billingCycle === 'monthly' ? 'per month · cancel anytime' : 'per year · $5.75/month';

  const handleSelectBloom = () => {
    trackUpgradeTapped('bloom', billingCycle);
    showToast('Coming soon', `Bloom ${billingCycle} billing will be live shortly.`);
  };

  const handleSelectHeirloom = () => {
    trackUpgradeTapped('heirloom', 'one_time');
    showToast('Coming soon', 'Heirloom ordering will be available soon.');
  };

  useEffect(() => {
    trackUpgradeScreenViewed(currentPlanId);
  }, [currentPlanId]);

  const handleLogout = () => {
    trackSignedOut();
    logout();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Personalised header */}
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

        {/* Current plan summary */}
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
          <Text style={styles.currentPrice}>
            {currentPlanId === 'seedling' ? 'Free forever' : bloomStatusLabel(subscription)}
          </Text>
          <View style={styles.currentFeatures}>
            {(currentPlanId === 'seedling'
              ? [
                  '200 photos & videos',
                  '10 milestones tracked',
                  'Basic scrapbook layouts',
                  'Share with 1 family member',
                ]
              : [
                  'Unlimited photos & videos',
                  'All 200+ milestones',
                  'Premium scrapbook layouts',
                  'Share with 10 family members',
                  'Yearly video montage',
                ]
            ).map((feat) => (
              <View key={feat} style={styles.featRow}>
                <Text style={styles.featCheck}>✓</Text>
                <Text style={styles.featText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Upgrade section */}
        {!isCurrentlyBloom && (
          <View style={styles.upgradeSection}>
            <EyebrowLabel color={Colors.gold}>Upgrade</EyebrowLabel>

            {/* Billing toggle — shown only on Bloom card */}
            <BillingToggle cycle={billingCycle} onChange={setBillingCycle} />

            {/* Bloom card */}
            <View style={[styles.planCard, styles.planCardRec]}>
              <View style={styles.recBadge}>
                <Text style={styles.recBadgeText}>MOST LOVED</Text>
              </View>

              <View style={styles.planTop}>
                <Text style={styles.planName}>Bloom</Text>
                <View>
                  <Text style={styles.planPrice}>{bloomPrice}</Text>
                  <Text style={styles.planPeriod}>{bloomPeriod}</Text>
                  {billingCycle === 'annual' && (
                    <Text style={styles.annualSavings}>$27 cheaper than monthly</Text>
                  )}
                </View>
              </View>

              <View style={styles.planFeatures}>
                {[
                  'Unlimited photos & videos',
                  'All 200+ milestones',
                  'Premium scrapbook layouts',
                  'Share with 10 family members',
                  'Yearly video montage',
                  'Printed book discounts',
                ].map((feat) => (
                  <View key={feat} style={styles.featRow}>
                    <Text style={[styles.featCheck, { color: Colors.sageDark }]}>✓</Text>
                    <Text style={[styles.featText, { color: Colors.inkLight }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.planBtnFilled}
                onPress={handleSelectBloom}
                activeOpacity={0.85}
              >
                <Text style={styles.planBtnTextFilled}>
                  {billingCycle === 'monthly' ? 'START BLOOM — $8/MONTH' : 'START BLOOM — $69/YEAR'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Heirloom card */}
            <View style={[styles.planCard, { marginTop: 12 }]}>
              <View style={styles.planTop}>
                <Text style={styles.planName}>Heirloom</Text>
                <View>
                  <Text style={styles.planPrice}>$79</Text>
                  <Text style={styles.planPeriod}>one-time · gift</Text>
                </View>
              </View>

              {/* Overlap note — shown when there's something to explain */}
              <View style={styles.overlapNote}>
                <Text style={styles.overlapNoteTitle}>WHAT HAPPENS WITH YOUR BLOOM</Text>
                <Text style={styles.overlapNoteText}>{heirloomNote}</Text>
              </View>

              <View style={styles.planFeatures}>
                {[
                  '1 printed hardcover scrapbook',
                  '12 months of Bloom — stacks on existing',
                  'Shipped to your door',
                  'No subscription started',
                  'Perfect baby shower gift',
                ].map((feat) => (
                  <View key={feat} style={styles.featRow}>
                    <Text style={[styles.featCheck, { color: Colors.sageDark }]}>✓</Text>
                    <Text style={[styles.featText, { color: Colors.inkLight }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.planBtnOutline}
                onPress={handleSelectHeirloom}
                activeOpacity={0.85}
              >
                <Text style={styles.planBtnTextOutline}>BUY AS A GIFT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            <Text style={styles.privacyStrong}>🔒 Our promise: </Text>
            Upgrading never changes what we do with your data. Zero ads. Zero data sharing.
            Always. Cancel Bloom anytime — no questions asked.
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
              <Text
                style={[
                  styles.accountValue,
                  { color: user?.emailVerified ? Colors.sageDark : Colors.sienna },
                ]}
              >
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

          {/* Restore purchases — required by App Store guidelines */}
          <TouchableOpacity
            style={[styles.signOutBtn, { marginBottom: Spacing.sm }]}
            onPress={() => showToast('Checking purchases…', 'Restoring your previous subscription.')}
            activeOpacity={0.8}
          >
            <Text style={[styles.signOutText, { color: Colors.inkMedium }]}>Restore purchases</Text>
          </TouchableOpacity>

          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSep}>·</Text>
            <TouchableOpacity onPress={() => router.push('/legal/terms')}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
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
  sub: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm,
    color: 'rgba(251,247,242,0.55)', lineHeight: 20,
  },

  // Current plan
  currentPlan: { margin: Spacing.xl, padding: Spacing['2xl'], overflow: 'hidden', position: 'relative' },
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

  // Upgrade section
  upgradeSection: { paddingHorizontal: Spacing.xl },

  // Plan cards
  planCard: {
    backgroundColor: Colors.warm, borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.25)', padding: Spacing['2xl'],
    position: 'relative', marginTop: 10,
  },
  planCardRec: { borderColor: Colors.sienna },
  recBadge: {
    position: 'absolute', top: -10, left: 20,
    backgroundColor: Colors.sienna, paddingVertical: 3, paddingHorizontal: 10,
  },
  recBadgeText: { fontFamily: 'DMSans_500Medium', fontSize: 8, letterSpacing: 1, color: '#fff' },

  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  planName: { fontFamily: 'CormorantGaramond_300Light', fontSize: 22, color: Colors.ink },
  planPrice: { fontFamily: 'CormorantGaramond_300Light', fontSize: 28, color: Colors.ink, textAlign: 'right' },
  planPeriod: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.inkMedium, textAlign: 'right' },
  annualSavings: {
    fontFamily: 'DMSans_500Medium', fontSize: 9, color: Colors.sageDark,
    textAlign: 'right', marginTop: 2,
  },

  planFeatures: { gap: 7, marginBottom: 16 },

  planBtnFilled: {
    padding: 14, alignItems: 'center', borderRadius: 2,
    backgroundColor: Colors.sienna,
  },
  planBtnTextFilled: { fontFamily: 'DMSans_400Regular', fontSize: 11, letterSpacing: 1, color: '#fff' },

  planBtnOutline: {
    padding: 14, alignItems: 'center', borderRadius: 2,
    borderWidth: 1, borderColor: 'rgba(196,169,160,0.4)', backgroundColor: 'transparent',
  },
  planBtnTextOutline: { fontFamily: 'DMSans_400Regular', fontSize: 11, letterSpacing: 1, color: Colors.inkLight },

  // Heirloom overlap note
  overlapNote: {
    backgroundColor: 'rgba(201,169,110,0.08)', borderWidth: 1,
    borderColor: 'rgba(201,169,110,0.25)', padding: 12, marginBottom: 14,
  },
  overlapNoteTitle: {
    fontFamily: 'DMSans_500Medium', fontSize: 8, letterSpacing: 1,
    color: Colors.gold, marginBottom: 5, textTransform: 'uppercase',
  },
  overlapNoteText: {
    fontFamily: 'DMSans_400Regular', fontSize: 11,
    color: Colors.inkLight, lineHeight: 18,
  },

  // Privacy
  privacyNote: {
    margin: Spacing.xl, padding: Spacing.mdPlus, paddingLeft: 16,
    backgroundColor: 'rgba(181,196,177,0.12)', borderLeftWidth: 2, borderLeftColor: Colors.sageDark,
  },
  privacyText: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: Colors.inkLight, lineHeight: 20 },
  privacyStrong: { fontFamily: 'DMSans_500Medium', color: Colors.sageDark },

  // Account
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
  legalRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginBottom: Spacing.md,
  },
  legalLink: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs,
    color: Colors.inkMedium, textDecorationLine: 'underline',
  },
  legalSep: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.inkMedium,
  },
});
