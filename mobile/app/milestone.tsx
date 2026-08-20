import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Icon } from '@/components';
import type { IconName } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { captureMilestone } from '@/firebase/firestore';
import { defForKey, iconForFirst } from '@/data/firsts';
import { GROWTH_DISCLAIMER } from '@/data/growth';
import { preciseAge, weekdayName } from '@/lib/age';
import { formatTime } from '@/lib/format';
import { colors, radius } from '@/theme';

export default function MilestoneMoment() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby } = useAuth();
  const params = useLocalSearchParams<{ id?: string; key?: string; label?: string; preview?: string }>();

  const def = useMemo(() => defForKey(params.key), [params.key]);
  const label = params.label ?? def?.label ?? 'A new first';
  const icon: IconName = (def?.icon as IconName) ?? iconForFirst(params.key);
  const description = def?.description;
  const isPreview = params.preview === '1';
  const now = new Date();

  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(glow, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, [glow]);

  const markCaught = async () => {
    if (activeBaby && params.id) {
      try {
        await captureMilestone(activeBaby.id, params.id);
      } catch {
        /* non-fatal */
      }
    }
    router.replace({ pathname: '/milestone', params: { key: params.key, label } });
  };

  const writeItDown = () => {
    router.replace({
      pathname: '/journal-entry',
      params: { prompt: 'What were you feeling in this moment?', milestone: label },
    });
  };

  const ageLine = (() => {
    const pa = preciseAge(activeBaby?.birthDate, now);
    return `${pa ? `${pa} · ` : ''}${weekdayName(now)} ${formatTime(now)}`;
  })();

  const glowColor = isPreview ? 'rgba(193,123,92,0.22)' : 'rgba(122,158,126,0.22)';

  return (
    <View style={styles.flex}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glow }]} pointerEvents="none">
        <LinearGradient colors={[glowColor, 'transparent']} start={{ x: 0.5, y: 0.15 }} end={{ x: 0.5, y: 0.9 }} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Pressable onPress={() => router.back()} hitSlop={12} style={[styles.close, { top: insets.top + 12 }]}>
        <Icon name="close" size={26} color={colors.onDark60} />
      </Pressable>

      <ScrollView
        contentContainerStyle={[styles.center, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconRing, { borderColor: isPreview ? 'rgba(193,123,92,0.4)' : 'rgba(122,158,126,0.4)' }]}>
          <Icon name={icon} size={40} color={isPreview ? colors.sienna : colors.sageDark} />
        </View>

        <AppText variant="label" color={isPreview ? colors.sienna : colors.sageDark} style={styles.eyebrow}>
          {isPreview ? `Coming soon${def ? ` · ${def.typicalAge}` : ''}` : 'First caught'}
        </AppText>

        <AppText variant="display" color={colors.cream} center style={styles.title}>
          {isPreview ? '' : `${activeBaby?.name ?? 'Baby'}’s\n`}
          <AppText variant="displayItalic" color={colors.rose} style={styles.title}>{label}</AppText>
        </AppText>

        {!isPreview ? (
          <AppText variant="caption" color={colors.onDark40} center style={styles.age}>{ageLine}</AppText>
        ) : null}

        {isPreview ? (
          <>
            {description ? (
              <AppText variant="serifItalic" color={colors.onDark60} center style={styles.desc}>“{description}”</AppText>
            ) : null}
            {def?.sourceNote ? (
              <AppText variant="caption" color={colors.onDark40} center style={styles.source}>
                {def.sourceNote}
              </AppText>
            ) : null}
            <View style={styles.readyRow}>
              <Icon name="notifications-outline" size={14} color={colors.sageDark} />
              <AppText variant="caption" color={colors.sageDark}>
                A quiet reminder, if you’ve switched them on — never a deadline.
              </AppText>
            </View>
            {def && def.source !== 'flourish' ? (
              <AppText variant="caption" color={colors.onDark25} center style={styles.disclaimer}>
                {GROWTH_DISCLAIMER}
              </AppText>
            ) : null}
            <View style={styles.actions}>
              <Button label="I caught it" onPress={markCaught} />
              <Button label="Close" variant="ghost" onPress={() => router.back()} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.promptBox}>
              <AppText variant="label" color={colors.sienna} style={styles.promptLabel}>Only you will ever read this —</AppText>
              <AppText variant="serifItalic" color={colors.onDark60} style={styles.promptText}>
                What were you feeling in this moment?
              </AppText>
            </View>
            <View style={styles.actions}>
              <Button label="Write it down" onPress={writeItDown} />
              <Button label="Done" variant="ghost" onPress={() => router.replace('/(tabs)/firsts')} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ink },
  close: { position: 'absolute', right: 20, zIndex: 10 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  eyebrow: { marginBottom: 12 },
  title: { fontSize: 36, lineHeight: 40 },
  age: { marginTop: 12, letterSpacing: 0.6 },
  desc: { marginTop: 18, fontSize: 15, lineHeight: 24, maxWidth: 300 },
  source: { marginTop: 14, lineHeight: 18, maxWidth: 320 },
  readyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 20, maxWidth: 300 },
  disclaimer: { marginTop: 16, lineHeight: 16, maxWidth: 320 },
  promptBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.md,
    padding: 18,
    marginTop: 24,
    alignSelf: 'stretch',
  },
  promptLabel: { marginBottom: 8 },
  promptText: { fontSize: 15, lineHeight: 24 },
  actions: { alignSelf: 'stretch', gap: 4, marginTop: 24 },
});
