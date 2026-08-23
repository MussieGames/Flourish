import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, InfoBox, SectionLabel } from '@/components';
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
];

const HEIRLOOM_FEATURES = [
  'Everything in Bloom for 12 months',
  'A 10×10 hardcover of the pictures you choose',
  'HD print on 440gsm photographic pages',
  'Mailed to the address you give us',
  'Nothing else starts — after 12 months, continue Bloom at $8/mo or stay free',
];

function membershipName(plan: PlanId): string {
  if (plan === 'bloom' || plan === 'heirloom') return 'Bloom';
  return 'Seedling';
}

export default function Plan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile } = useAuth();
  const currentPlan = profile?.plan ?? 'seedling';
  const onBloom = currentPlan === 'bloom' || currentPlan === 'heirloom';

  const chooseBloom = () => {
    Alert.alert(
      'Upgrade to Bloom',
      'In the production app this opens secure in-app billing via the App Store / Google Play. For this preview build we’ll switch your membership directly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            if (user) updateUserPlan(user.uid, 'bloom').catch(() => {});
          },
        },
      ],
    );
  };

  const orderHeirloom = () => {
    Alert.alert(
      'Order the Heirloom',
      'This is the book — not another membership. You’ll pick the pictures, approve a proof, and we’ll mail a 10×10 hardcover. Twelve months of Bloom is included. Billing will be App Store / Google Play in production.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            if (user) updateUserPlan(user.uid, 'heirloom').catch(() => {});
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
          Membership & the book
        </AppText>
        <AppText variant="display" color={colors.cream}>
          Bloom is the app.{'\n'}
          <AppText variant="displayItalic" color={colors.gold}>
            Heirloom is the book.
          </AppText>
        </AppText>
        <AppText variant="caption" color={colors.onDark40} style={styles.headerSub}>
          $8 keeps their story going. The hardcover is a gift you order when you’re ready — not a third plan.
        </AppText>
      </View>

      <LinearGradient colors={[colors.ink, '#3D2820']} style={styles.currentPlan}>
        <View style={styles.currentBadge}>
          <AppText variant="label" color={colors.ink} style={styles.currentBadgeText}>
            Your membership
          </AppText>
        </View>
        <AppText variant="title" color={colors.cream}>
          {membershipName(currentPlan)}
        </AppText>
        <AppText variant="caption" color={colors.onDark40} style={styles.currentPrice}>
          {currentPlan === 'seedling'
            ? 'Free forever'
            : currentPlan === 'heirloom'
              ? 'Bloom year included with your book'
              : '$8 / month'}
        </AppText>
        {(onBloom ? BLOOM_FEATURES : SEEDLING_FEATURES).map((f) => (
          <Feature key={f} text={f} color={colors.gold} textColor={colors.onDark60} />
        ))}
      </LinearGradient>

      <View style={styles.cards}>
        <SectionLabel>Membership</SectionLabel>
        <AppText variant="caption" color={colors.inkMuted} style={styles.sectionHelp}>
          Seedling is free. Bloom is $8 a month — unlimited capture, sharing, and firsts.
        </AppText>

        <View style={[styles.card, styles.seedlingCard]}>
          <View style={styles.cardTop}>
            <AppText variant="title">Seedling</AppText>
            <View style={styles.priceCol}>
              <AppText variant="title">$0</AppText>
              <AppText variant="caption" style={styles.period}>
                free forever
              </AppText>
            </View>
          </View>
          {SEEDLING_FEATURES.map((f) => (
            <Feature key={f} text={f} />
          ))}
          <View style={styles.cardButton}>
            <Button
              label={currentPlan === 'seedling' ? 'Your current membership' : 'Included if you leave Bloom'}
              disabled
              variant="outline"
            />
          </View>
        </View>

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
              label={onBloom ? 'Your current membership' : 'Upgrade to Bloom'}
              disabled={onBloom}
              onPress={chooseBloom}
            />
          </View>
        </View>

        <View style={styles.bookLabel}>
          <SectionLabel>The book</SectionLabel>
        </View>
        <AppText variant="caption" color={colors.inkMuted} style={styles.sectionHelp}>
          Not a plan. A 10×10 hardcover of the pictures you choose, mailed to you — with a year of Bloom.
        </AppText>

        <View style={[styles.card, styles.bookCard]}>
          <AppText variant="label" color={colors.gold} style={styles.bookEyebrow}>
            Heirloom
          </AppText>
          <View style={styles.cardTop}>
            <View style={styles.flex1}>
              <AppText variant="title">Bloom, plus the book</AppText>
            </View>
            <View style={styles.priceCol}>
              <AppText variant="title">$229</AppText>
              <AppText variant="caption" style={styles.period}>
                once
              </AppText>
            </View>
          </View>
          <InfoBox accent={colors.gold} tint="rgba(201,169,110,0.1)" style={styles.clarity}>
            <AppText variant="caption" color={colors.inkLight} style={styles.clarityText}>
              You choose the pictures. You approve a proof. We print a 10×10 HD book on 440gsm pages and
              mail it. Twelve months of Bloom is included. After that, stay on Bloom at $8/mo or return to
              Seedling. Extra pages are $6 each if you want more than 20.
            </AppText>
          </InfoBox>
          {HEIRLOOM_FEATURES.map((f) => (
            <Feature key={f} text={f} />
          ))}
          <View style={styles.cardButton}>
            <Button
              label={currentPlan === 'heirloom' ? 'Book already included' : 'Order the Heirloom'}
              disabled={currentPlan === 'heirloom'}
              onPress={orderHeirloom}
            />
          </View>
          <AppText variant="caption" color={colors.inkMuted} style={styles.giftHint}>
            Also a baby-shower gift — we can post it to someone else.
          </AppText>
        </View>
      </View>

      <InfoBox accent={colors.sageDark} style={styles.promise}>
        <View style={styles.promiseRow}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.sageDark} />
          <AppText variant="caption" color={colors.inkLight} style={styles.promiseText}>
            <AppText style={styles.promiseStrong}>Our promise: </AppText>
            Ordering a book never changes what we do with your data. Zero ads. Zero data sharing. Cancel
            Bloom any time.
          </AppText>
        </View>
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
  flex1: { flex: 1, paddingRight: 12 },
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerLabel: { marginTop: 16, marginBottom: 8 },
  headerSub: { marginTop: 8, lineHeight: 18 },
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
  cards: { padding: 20, paddingTop: 8 },
  sectionHelp: { marginTop: -4, marginBottom: 12, lineHeight: 18 },
  bookLabel: { marginTop: 18, marginBottom: -8 },
  seedlingCard: { marginBottom: 14 },
  card: {
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 22,
  },
  recommended: { borderColor: colors.sienna, marginTop: 12 },
  bookCard: { borderColor: 'rgba(201,169,110,0.45)', backgroundColor: '#FBF6EC' },
  recBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: colors.sienna,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  recBadgeText: { letterSpacing: 1, fontSize: 8 },
  bookEyebrow: { marginBottom: 8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  priceCol: { alignItems: 'flex-end' },
  period: { fontSize: 10 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  featureText: { flex: 1, fontSize: 12 },
  cardButton: { marginTop: 16 },
  giftHint: { marginTop: 10, lineHeight: 18, textAlign: 'center' },
  clarity: { marginBottom: 12 },
  clarityText: { lineHeight: 17 },
  promise: { marginHorizontal: 20, marginTop: 8 },
  promiseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  promiseText: { flex: 1, lineHeight: 18 },
  promiseStrong: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.sageDark },
});
