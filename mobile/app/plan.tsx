import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Icon } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { updateUserPlan } from '@/firebase/firestore';
import { colors, fonts, radius } from '@/theme';
import type { PlanId } from '@/types/models';

export default function Plan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile } = useAuth();
  const current = profile?.plan ?? 'seedling';

  const choose = (plan: PlanId, name: string) => {
    Alert.alert(
      `Upgrade to ${name}`,
      'In the live app this opens secure in-app billing (App Store / Google Play). For this preview we’ll switch your plan directly.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => user && updateUserPlan(user.uid, plan).catch(() => {}) },
      ],
    );
  };

  const gift = () => {
    Alert.alert('Give the Heirloom', 'A gifting flow (recipient, message, delivery date) is coming soon — the perfect baby-shower gift.');
  };

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="close" size={26} color={colors.cream} />
        </Pressable>
        <AppText variant="label" color={colors.gold}>Your plan</AppText>
        <AppText variant="display" color={colors.cream}>
          Simple, <AppText variant="displayItalic" color={colors.gold}>honest</AppText> pricing.
        </AppText>
        <AppText variant="caption" color={colors.onDark40} style={styles.sub}>No surprises. No selling your data. Ever.</AppText>
      </View>

      <View style={styles.cards}>
        {/* Seedling */}
        <View style={styles.card}>
          <AppText variant="serifItalic" color={colors.inkMuted} style={styles.intent}>The moments you choose to keep.</AppText>
          <View style={styles.cardHead}>
            <Badge label="Seedling" tint="rgba(140,120,112,0.1)" color={colors.inkMuted} />
          </View>
          <AppText variant="display" color={colors.sienna} style={styles.price}>$0</AppText>
          {['300 photos · 20 short videos', 'Firsts from newborn through school', 'Journal & scrapbook', 'Add your own firsts'].map((f) => (
            <Feature key={f} text={f} />
          ))}
          <View style={styles.cta}>
            <Button label={current === 'seedling' ? 'Your current plan' : 'Downgrade'} variant="outline" disabled={current === 'seedling'} onPress={() => {}} />
          </View>
        </View>

        {/* Bloom */}
        <View style={[styles.card, styles.cardBloom]}>
          <AppText variant="serifItalic" color={colors.inkMuted} style={styles.intent}>Keep every moment, and share them privately.</AppText>
          <View style={styles.cardHead}>
            <Badge label="Bloom" tint="rgba(193,123,92,0.14)" color={colors.sienna} />
          </View>
          <View style={styles.priceRow}>
            <AppText variant="display" color={colors.sienna} style={styles.price}>$8</AppText>
            <AppText variant="caption" color={colors.inkMuted} style={styles.per}>/ month</AppText>
          </View>
          {['Everything in Seedling', 'Unlimited photos & videos', 'Private family sharing', 'Printed book ordering'].map((f) => (
            <Feature key={f} text={f} />
          ))}
          <View style={styles.cta}>
            <Button label={current === 'bloom' ? 'Your current plan' : 'Upgrade to Bloom'} disabled={current === 'bloom'} onPress={() => choose('bloom', 'Bloom')} />
          </View>
          <AppText variant="serifItalic" color={colors.sienna} center style={styles.reframe}>
            Less than $2 a week to keep capturing — not just the first two years
          </AppText>
          <AppText variant="caption" color={colors.inkMuted} center style={styles.clarity}>Cancel anytime · no lock-in</AppText>
        </View>

        {/* Heirloom */}
        <View style={[styles.card, styles.cardHeirloom]}>
          <AppText variant="serifItalic" color="rgba(201,169,110,0.6)" style={styles.intent}>For parents who want to hold everything.</AppText>
          <View style={styles.cardHead}>
            <Badge label="Heirloom" tint="rgba(201,169,110,0.16)" color={colors.gold} />
            <View style={styles.social}>
              <Icon name="star" size={11} color={colors.sageDark} />
              <AppText variant="caption" color={colors.sageDark}>Most gifted at baby showers</AppText>
            </View>
          </View>
          <View style={styles.priceRow}>
            <AppText variant="display" color={colors.gold} style={styles.price}>$79</AppText>
            <AppText variant="caption" color="rgba(201,169,110,0.6)" style={styles.per}>once</AppText>
          </View>
          {['Unlimited photos & videos', 'Private family sharing', '1 printed hardcover book', 'No subscription starts'].map((f) => (
            <Feature key={f} text={f} onDark />
          ))}
          <View style={styles.cta}>
            <Button label="Get the Heirloom" variant="dark" onPress={() => choose('heirloom', 'Heirloom')} />
          </View>
          <Pressable style={styles.giftBtn} onPress={gift}>
            <Icon name="gift-outline" size={15} color={colors.gold} />
            <AppText variant="label" color={colors.gold} style={styles.giftText}>Buy as a gift for someone</AppText>
          </Pressable>
          <AppText variant="caption" color="rgba(251,247,242,0.35)" center style={styles.clarity}>$79 once. No ongoing charges. Ever.</AppText>
        </View>
      </View>

      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  );
}

function Badge({ label, tint, color }: { label: string; tint: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: tint }]}>
      <AppText variant="label" color={color} style={styles.badgeText}>{label}</AppText>
    </View>
  );
}

function Feature({ text, onDark }: { text: string; onDark?: boolean }) {
  return (
    <View style={styles.feature}>
      <Icon name="checkmark" size={14} color={colors.sageDark} />
      <AppText variant="caption" color={onDark ? colors.onDark60 : colors.inkLight} style={styles.featureText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  hero: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingBottom: 24 },
  back: { marginBottom: 8 },
  sub: { marginTop: 8 },
  cards: { padding: 20, gap: 14 },
  card: { backgroundColor: colors.warm, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: 18 },
  cardBloom: { borderColor: 'rgba(193,123,92,0.4)', backgroundColor: '#FDF3EC' },
  cardHeirloom: { backgroundColor: colors.ink, borderColor: 'rgba(201,169,110,0.25)' },
  intent: { fontSize: 13, marginBottom: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgeText: { letterSpacing: 1 },
  social: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  price: { fontSize: 34, lineHeight: 38 },
  per: { marginBottom: 8 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  featureText: { flex: 1, fontSize: 12.5 },
  cta: { marginTop: 16 },
  reframe: { marginTop: 12, fontSize: 13 },
  clarity: { marginTop: 6 },
  giftBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)', borderRadius: radius.sm,
    paddingVertical: 12, marginTop: 8,
  },
  giftText: { letterSpacing: 0.8 },
});
