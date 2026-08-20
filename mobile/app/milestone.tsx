import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { formatLongDate } from '@/lib/age';
import { formatTime } from '@/lib/format';
import { colors } from '@/theme';

const CONFETTI = ['✨', '🌸', '⭐', '🌿', '💛'];

export default function MilestoneMoment() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby } = useAuth();
  const params = useLocalSearchParams<{ emoji?: string; label?: string; preview?: string }>();

  const emoji = params.emoji ?? '🎉';
  const label = params.label ?? 'A new first';
  const isPreview = params.preview === '1';
  const now = new Date();

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const share = async () => {
    try {
      await Share.share({
        message: `${activeBaby?.name ?? 'Our baby'} just reached a milestone: ${label}! 💛 — shared from Flourish`,
      });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['rgba(193,123,92,0.25)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', 'rgba(181,196,177,0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Pressable onPress={() => router.back()} hitSlop={12} style={[styles.close, { top: insets.top + 12 }]}>
        <Ionicons name="close" size={26} color={colors.onDark60} />
      </Pressable>

      <View style={[styles.confetti, { top: insets.top + 8 }]} pointerEvents="none">
        {CONFETTI.map((c) => (
          <AppText key={c} style={styles.confettiItem}>
            {c}
          </AppText>
        ))}
      </View>

      <View style={styles.center}>
        <View style={styles.badge}>
          <AppText variant="label" color={colors.white} style={styles.badgeText}>
            {isPreview ? 'Coming soon' : 'First captured'}
          </AppText>
        </View>

        <Animated.Text style={[styles.emoji, { transform: [{ scale: pulse }] }]}>{emoji}</Animated.Text>

        <AppText variant="display" color={colors.cream} center style={styles.title}>
          {activeBaby?.name ?? 'Baby'}&apos;s{'\n'}
          <AppText variant="displayItalic" color={colors.rose} style={styles.titleItalic}>
            {label}
          </AppText>
        </AppText>

        <AppText variant="caption" color={colors.onDark40} center style={styles.date}>
          {formatLongDate(now)} · {formatTime(now)}
        </AppText>

        <AppText variant="bodyLight" color={colors.onDark60} center style={styles.para}>
          {isPreview
            ? 'Keep your camera close — this one is just around the corner, and you won’t want to miss it.'
            : 'You caught it. The one that changes everything — and it was meant just for you.'}
        </AppText>

        <View style={styles.actions}>
          <Button label="📸 Add a photo of this moment" onPress={() => router.replace('/(tabs)/capture')} />
          <Button label="Save to scrapbook →" variant="ghost" onPress={() => router.replace('/(tabs)/scrapbook')} />
        </View>

        <View style={styles.shareRow}>
          <Pressable style={styles.shareIcon} onPress={share}>
            <Ionicons name="share-social-outline" size={18} color={colors.onDark60} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ink },
  close: { position: 'absolute', right: 20, zIndex: 10 },
  confetti: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 },
  confettiItem: { fontSize: 20, opacity: 0.6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  badge: {
    backgroundColor: colors.sienna,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 2,
    marginBottom: 24,
  },
  badgeText: { letterSpacing: 1.5 },
  emoji: { fontSize: 72, marginBottom: 20 },
  title: { fontSize: 40, lineHeight: 44 },
  titleItalic: { fontSize: 40, lineHeight: 44 },
  date: { marginTop: 12, letterSpacing: 1 },
  para: { marginTop: 24, marginBottom: 32, maxWidth: 300 },
  actions: { alignSelf: 'stretch', gap: 6 },
  shareRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  shareIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
