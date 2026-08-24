import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, InfoBox, SectionLabel } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { updateUserPlan } from '@/firebase/firestore';
import { colors, fonts, radius } from '@/theme';

const SEEDLING_FEATURES = [
  '200 photos',
  '25 milestones tracked',
  'Basic scrapbook layouts',
  'Just for you — no sharing',
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
  'An 11×8.5″ hardcover of the pictures you choose',
  'HD print on 440gsm photographic pages',
  'Posted to the address you approve on the proof',
  'Nothing else starts — after 12 months, continue Bloom at $8/mo or stay free',
];

export default function Plan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile } = useAuth();
  const currentPlan = profile?.plan ?? 'seedling';
  const onSeedling = currentPlan === 'seedling';
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
      'This is the book — not another membership. You’ll pick the pictures, approve a proof that shows the posting address, and we’ll mail an 11×8.5″ hardcover. Twelve months of Bloom is included. Billing will be App Store / Google Play in production.',
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
          Keep their days.{'\n'}
          <AppText variant="displayItalic" color={colors.gold}>
            Hold them when you’re ready.
          </AppText>
        </AppText>
        <AppText variant="caption" color={colors.onDark40} style={styles.headerSub}>
          A quiet membership for the everyday. The hardcover is a gift you order — not another plan.
        </AppText>
      </View>

      <View style={styles.cards}>
        <SectionLabel>Membership</SectionLabel>
        <AppText variant="caption" color={colors.inkMuted} style={styles.sectionHelp}>
          Seedling is free — 200 photos, just for you. Bloom is $8 a month, with sharing and room for everything.
        </AppText>

        <View style={[styles.card, styles.seedlingCard, onSeedling && styles.cardCurrent]}>
          {onSeedling ? (
            <View style={styles.yoursBadge}>
              <AppText variant="label" color={colors.ink} style={styles.yoursBadgeText}>
                Yours
              </AppText>
            </View>
          ) : null}
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
          {onSeedling ? (
            <View style={styles.cardButton}>
              <Button label="Your current membership" disabled variant="outline" />
            </View>
          ) : null}
        </View>

        <View style={[styles.card, styles.bloomCard, onBloom && styles.cardCurrent]}>
          <View style={onBloom ? styles.yoursBadge : styles.recBadge}>
            <AppText
              variant="label"
              color={onBloom ? colors.ink : colors.white}
              style={onBloom ? styles.yoursBadgeText : styles.recBadgeText}
            >
              {onBloom ? 'Yours' : 'Most loved'}
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
          {currentPlan === 'heirloom' ? (
            <AppText variant="caption" color={colors.inkMuted} style={styles.bloomNote}>
              Included with your book for 12 months
            </AppText>
          ) : null}
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
          Not a plan. An 11×8.5″ hardcover of the pictures you choose, mailed to you — with a year of Bloom.
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
              You choose the pictures. You approve a proof that includes the posting address. We print an
              11×8.5″ HD book on 440gsm pages and mail it there. We never keep a standing home address on
              your account. Twelve months of Bloom is included. After that, stay on Bloom at $8/mo or return
              to Seedling. Extra pages are $6 each if you want more than 20.
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
            Only you can order. Posted to the address on the proof you approve — we never save a home
            address.
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
  cards: { padding: 20, paddingTop: 16 },
  sectionHelp: { marginTop: -4, marginBottom: 12, lineHeight: 18 },
  bookLabel: { marginTop: 18, marginBottom: -8 },
  seedlingCard: { marginBottom: 14, marginTop: 8 },
  bloomCard: { borderColor: colors.sienna, marginTop: 12 },
  card: {
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 22,
  },
  cardCurrent: {
    borderColor: colors.gold,
    backgroundColor: '#FBF6EC',
    shadowColor: colors.gold,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bookCard: { borderColor: 'rgba(201,169,110,0.45)', backgroundColor: '#FBF6EC' },
  yoursBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  yoursBadgeText: { letterSpacing: 1.2 },
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
  bloomNote: { marginTop: -8, marginBottom: 10, lineHeight: 18 },
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
