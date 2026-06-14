import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, InfoBox } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { updateUserPlan } from '@/firebase/firestore';
import { colors, fonts, radius } from '@/theme';
import type { PlanId } from '@/types/models';

const SEEDLING_FEATURES = [
  '500 photos & videos',
  '25 milestones tracked',
  'Basic scrapbook layouts',
  'Share with 2 family members',
];

const BLOOM_FEATURES = [
  'Unlimited photos & videos',
  'All 200+ milestones',
  'Premium scrapbook layouts',
  'Share with 10 family members',
  'Yearly video montage',
  'Printed book discounts',
];

const HEIRLOOM_FEATURES = [
  '1 printed hardcover scrapbook',
  '12 months of Bloom included',
  'Shipped to your door',
  'No subscription started',
  'Perfect baby shower gift',
];

export default function Plan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile } = useAuth();
  const currentPlan = profile?.plan ?? 'seedling';

  const choosePlan = (plan: PlanId, name: string) => {
    Alert.alert(
      `Upgrade to ${name}`,
      'In the production app this opens secure in-app billing via the App Store / Google Play. For this preview build we’ll switch your plan directly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            if (user) updateUserPlan(user.uid, plan).catch(() => {});
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.cream} />
        </Pressable>
        <AppText variant="label" color={colors.gold} style={styles.headerLabel}>
          Your plan
        </AppText>
        <AppText variant="display" color={colors.cream}>
          Simple,{'\n'}
          <AppText variant="displayItalic" color={colors.gold}>
            honest
          </AppText>{' '}
          pricing.
        </AppText>
        <AppText variant="caption" color={colors.onDark40} style={styles.headerSub}>
          No surprises. No selling your data. Just Flourish.
        </AppText>
      </View>

      {/* Current plan */}
      <LinearGradient colors={[colors.ink, '#3D2820']} style={styles.currentPlan}>
        <View style={styles.currentBadge}>
          <AppText variant="label" color={colors.ink} style={styles.currentBadgeText}>
            Current plan
          </AppText>
        </View>
        <AppText variant="title" color={colors.cream}>
          {currentPlan === 'bloom' ? 'Bloom' : currentPlan === 'heirloom' ? 'Heirloom' : 'Seedling'}
        </AppText>
        <AppText variant="caption" color={colors.onDark40} style={styles.currentPrice}>
          {currentPlan === 'seedling' ? 'Free forever' : currentPlan === 'bloom' ? '$8 / month' : 'One-time gift'}
        </AppText>
        {SEEDLING_FEATURES.map((f) => (
          <Feature key={f} text={f} color={colors.gold} textColor={colors.onDark60} />
        ))}
      </LinearGradient>

      <View style={styles.cards}>
        {/* Bloom */}
        <View style={[styles.card, styles.recommended]}>
          <View style={styles.recBadge}>
            <AppText variant="label" color={colors.white} style={styles.recBadgeText}>
              Most loved
            </AppText>
          </View>
          <View style={styles.cardTop}>
            <AppText variant="title">Bloom</AppText>
            <View style={styles.priceCol}>
              <AppText variant="title">$8</AppText>
              <AppText variant="caption" style={styles.period}>
                per month
              </AppText>
            </View>
          </View>
          {BLOOM_FEATURES.map((f) => (
            <Feature key={f} text={f} />
          ))}
          <View style={styles.cardButton}>
            <Button
              label={currentPlan === 'bloom' ? 'Your current plan' : 'Upgrade to Bloom'}
              disabled={currentPlan === 'bloom'}
              onPress={() => choosePlan('bloom', 'Bloom')}
            />
          </View>
        </View>

        {/* Heirloom */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <AppText variant="title">Heirloom</AppText>
            <View style={styles.priceCol}>
              <AppText variant="title">$79</AppText>
              <AppText variant="caption" style={styles.period}>
                one-time · gift
              </AppText>
            </View>
          </View>
          <InfoBox accent={colors.gold} tint="rgba(201,169,110,0.1)" style={styles.clarity}>
            <AppText variant="label" color={colors.gold} style={styles.clarityLabel}>
              What&apos;s included in $79
            </AppText>
            <AppText variant="caption" color={colors.inkLight} style={styles.clarityText}>
              One printed hardcover book + 12 months of Bloom access — paid once, nothing more.
              After 12 months, continue Bloom at $8/mo or stay free. The book is yours forever.
            </AppText>
          </InfoBox>
          {HEIRLOOM_FEATURES.map((f) => (
            <Feature key={f} text={f} />
          ))}
          <View style={styles.cardButton}>
            <Button label="Buy as a gift" variant="outline" onPress={() => choosePlan('heirloom', 'Heirloom')} />
          </View>
        </View>
      </View>

      <InfoBox accent={colors.sageDark} style={styles.promise}>
        <AppText variant="caption" color={colors.inkLight} style={styles.promiseText}>
          <AppText style={styles.promiseStrong}>🔒 Our promise: </AppText>
          Upgrading never changes what we do with your data. Zero ads. Zero data sharing. Always.
          Cancel Bloom any time — no questions asked.
        </AppText>
      </InfoBox>
      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  );
}

function Feature({
  text,
  color = colors.sageDark,
  textColor = colors.inkLight,
}: {
  text: string;
  color?: string;
  textColor?: string;
}) {
  return (
    <View style={styles.feature}>
      <Ionicons name="checkmark" size={14} color={color} />
      <AppText variant="caption" color={textColor} style={styles.featureText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerLabel: { marginTop: 16, marginBottom: 8 },
  headerSub: { marginTop: 8 },
  currentPlan: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 22,
    borderRadius: radius.md,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 12,
  },
  currentBadgeText: { letterSpacing: 1.2 },
  currentPrice: { marginTop: 4, marginBottom: 12 },
  cards: { padding: 20, gap: 16 },
  card: {
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 22,
  },
  recommended: { borderColor: colors.sienna },
  recBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: colors.sienna,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  recBadgeText: { letterSpacing: 1, fontSize: 8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  priceCol: { alignItems: 'flex-end' },
  period: { fontSize: 10 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  featureText: { flex: 1, fontSize: 12 },
  cardButton: { marginTop: 16 },
  clarity: { marginBottom: 12 },
  clarityLabel: { marginBottom: 4 },
  clarityText: { lineHeight: 17 },
  promise: { marginHorizontal: 20, marginTop: 4 },
  promiseText: { lineHeight: 18 },
  promiseStrong: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.sageDark },
});
