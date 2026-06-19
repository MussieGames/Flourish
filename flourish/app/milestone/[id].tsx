/**
 * Milestone Moment — full-screen celebration. No scroll. Just this moment.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../src/hooks/useAuth';
import { useBabyContext } from '../../src/contexts/BabyContext';
import { getFirebaseFirestore } from '../../src/services/firebase';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { useReviewPrompt } from '../../src/components/ReviewPrompt';
import { MILESTONE_TEMPLATES } from '../../src/constants/stickers';
import { trackMilestoneCelebrationViewed } from '../../src/services/analytics';
import { format } from 'date-fns';
import type { Milestone } from '../../src/types';

// ─── Reusable pulse animation ─────────────────────────────────────────────────
function usePulse(to: number, duration: number) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: to, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return anim;
}

// ─── Single confetti piece — reuses usePulse ─────────────────────────────────
function ConfettiItem({ emoji, delay }: { emoji: string; delay: number }) {
  const anim = usePulse(1, 2000 + delay * 0.1);
  return (
    <Animated.Text
      style={{
        fontSize: 22,
        opacity: anim.interpolate({ inputRange: [0.9, 1], outputRange: [0.4, 0.85] }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0.9, 1], outputRange: [14, 0] }) },
          { rotate: anim.interpolate({ inputRange: [0.9, 1], outputRange: ['-8deg', '8deg'] }) },
        ],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

const CONFETTI = ['✨', '🌸', '⭐', '🌿', '💛', '✦', '🎉'];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MilestoneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { activeBaby } = useBabyContext();
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  const emojiScale = usePulse(1.09, 1000);
  const orb1Scale = usePulse(1.12, 4000);
  const orb2Scale = usePulse(1.1, 5200);
  const { show: showReviewPrompt, checkShouldShow, ReviewPromptModal } = useReviewPrompt();

  useEffect(() => {
    if (!id) return;
    trackMilestoneCelebrationViewed(id);
    // Show review pre-prompt after the emotional peak of a milestone capture
    // 4-second delay so the celebration screen has time to breathe first
    checkShouldShow().then((should) => {
      if (should) setTimeout(() => showReviewPrompt(), 4000);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(getFirebaseFirestore(), 'milestones', id)).then((snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      setMilestone({
        id: snap.id,
        babyId: d.babyId,
        parentId: d.parentId,
        type: d.type,
        emoji: d.emoji,
        title: d.title,
        description: d.description,
        isCaptured: d.isCaptured,
        capturedAt: d.capturedAt?.toDate?.() ?? new Date(),
        createdAt: d.createdAt?.toDate?.() ?? new Date(),
        updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
      } as Milestone);
    });
  }, [id]);

  const template = MILESTONE_TEMPLATES.find((t) => t.id === milestone?.type);
  const displayEmoji = template?.emoji ?? milestone?.emoji ?? '⭐';
  const displayTitle = template?.title ?? milestone?.title ?? 'A wonderful first';
  const celebrationText =
    template?.celebrationText ??
    'You caught it. A moment that belongs entirely to you both. Capture it, feel it, keep it.';

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${activeBaby?.name ?? 'Our little one'} just had their ${displayTitle}! Captured with Flourish 🌿`,
      });
    } catch (_) {}
  }, [activeBaby?.name, displayTitle]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {ReviewPromptModal}
      <Animated.View style={[styles.orb1, { transform: [{ scale: orb1Scale }] }]} pointerEvents="none" />
      <Animated.View style={[styles.orb2, { transform: [{ scale: orb2Scale }] }]} pointerEvents="none" />

      <View style={styles.confettiRow} pointerEvents="none">
        {CONFETTI.map((e, i) => <ConfettiItem key={i} emoji={e} delay={i * 350} />)}
      </View>

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FIRST CAPTURED</Text>
        </View>

        <Animated.Text style={[styles.bigEmoji, { transform: [{ scale: emojiScale }] }]}>
          {displayEmoji}
        </Animated.Text>

        <Text style={styles.title}>
          {activeBaby?.name ?? 'Your little one'}'s{'\n'}
          <Text style={styles.titleItalic}>{displayTitle}</Text>
        </Text>

        <Text style={styles.date}>
          {format(
            milestone?.capturedAt ?? new Date(),
            "EEEE, d MMMM yyyy · h:mmaaa"
          )}
        </Text>

        <Text style={styles.para}>{celebrationText}</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <Button onPress={() => router.push('/(tabs)/capture')} title="📸 Add a photo of this moment" />
        <Button onPress={() => router.replace('/(tabs)/')} title="Save to scrapbook →" variant="outline" />

        <View style={styles.shareRow}>
          {(['👨‍👩‍👧', '💌', '📤'] as const).map((icon) => (
            <TouchableOpacity key={icon} style={styles.shareIcon} onPress={handleShare} activeOpacity={0.7}>
              <Text style={{ fontSize: 16 }}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ink, overflow: 'hidden' },

  orb1: {
    position: 'absolute', width: 420, height: 420, borderRadius: 210,
    backgroundColor: 'rgba(193,123,92,0.28)', top: -100, left: -80,
  },
  orb2: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(181,196,177,0.18)', bottom: -40, right: -60,
  },

  confettiRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl, paddingTop: 12, zIndex: 1,
  },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, zIndex: 1,
  },

  badge: {
    backgroundColor: Colors.sienna, paddingVertical: 4,
    paddingHorizontal: 16, marginBottom: 24,
  },
  badgeText: { fontFamily: 'DMSans_500Medium', fontSize: 9, letterSpacing: 1.5, color: '#fff' },

  bigEmoji: { fontSize: 80, marginBottom: 20 },

  title: {
    fontFamily: 'CormorantGaramond_300Light', fontSize: 42,
    color: Colors.cream, lineHeight: 50, textAlign: 'center', marginBottom: 12,
  },
  titleItalic: { fontFamily: 'CormorantGaramond_300Light_Italic', color: Colors.rose },

  date: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs,
    color: 'rgba(251,247,242,0.4)', letterSpacing: 0.8, marginBottom: 20, textAlign: 'center',
  },

  para: {
    fontFamily: 'DMSans_300Light', fontSize: 15,
    color: 'rgba(251,247,242,0.68)', lineHeight: 26, textAlign: 'center', maxWidth: 300,
  },

  footer: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl, gap: 10, zIndex: 1 },

  shareRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 6 },
  shareIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center',
  },

  closeBtn: { alignItems: 'center', paddingTop: 6 },
  closeBtnText: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm,
    color: 'rgba(251,247,242,0.3)', textDecorationLine: 'underline',
  },
});
