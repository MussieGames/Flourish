/**
 * Milestone Moment screen — full-screen celebration modal.
 * Displayed when a "first" is captured.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Share,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/hooks/useAuth';
import { useBaby } from '../../src/hooks/useBaby';
import { getMilestonesForBaby } from '../../src/services/firestore';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import type { Milestone } from '../../src/types';
import { MILESTONE_TEMPLATES } from '../../src/constants/stickers';
import { format } from 'date-fns';

const { width, height } = Dimensions.get('window');

const CONFETTI = ['✨', '🌸', '⭐', '🌿', '💛', '🎉', '🌸', '✦'];

function ConfettiItem({ emoji, delay }: { emoji: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.Text
      style={{
        fontSize: 20,
        opacity: 0.6,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 12, 0],
            }),
          },
          {
            rotate: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '10deg'],
            }),
          },
        ],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function MilestoneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { activeBaby } = useBaby(user?.uid ?? null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const orb1Anim = useRef(new Animated.Value(1)).current;
  const orb2Anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse emoji
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Orb animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1.1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1.1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 1, duration: 5000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!user?.uid || !activeBaby || !id) return;
    getMilestonesForBaby(user.uid, activeBaby.id).then((miles) => {
      const found = miles.find((m) => m.id === id);
      setMilestone(found ?? null);
    });
  }, [user?.uid, activeBaby, id]);

  const template = MILESTONE_TEMPLATES.find((t) => t.id === milestone?.type);
  const displayEmoji = template?.emoji ?? milestone?.emoji ?? '⭐';
  const displayTitle = template?.title ?? milestone?.title ?? 'A wonderful first';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${activeBaby?.name ?? 'Our little one'} just had their ${displayTitle}! Captured with Flourish 🌿`,
      });
    } catch (_) {}
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 52, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Animated orbs */}
      <Animated.View
        style={[styles.orb1, { transform: [{ scale: orb1Anim }] }]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.orb2, { transform: [{ scale: orb2Anim }] }]}
        pointerEvents="none"
      />

      {/* Confetti row */}
      <View style={styles.confettiRow}>
        {CONFETTI.slice(0, 5).map((e, i) => (
          <ConfettiItem key={i} emoji={e} delay={i * 400} />
        ))}
      </View>

      {/* Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>FIRST CAPTURED</Text>
      </View>

      {/* Pulsing emoji */}
      <Animated.Text
        style={[styles.bigEmoji, { transform: [{ scale: pulseAnim }] }]}
      >
        {displayEmoji}
      </Animated.Text>

      {/* Title */}
      <Text style={styles.title}>
        {activeBaby?.name ?? 'Your little one'}'s{'\n'}
        <Text style={styles.titleItalic}>{displayTitle}</Text>
      </Text>

      {/* Date */}
      <Text style={styles.date}>
        {milestone?.capturedAt
          ? format(milestone.capturedAt, "EEEE, d MMMM yyyy · h:mmaaa")
          : format(new Date(), "EEEE, d MMMM yyyy · h:mmaaa")}
      </Text>

      {/* Paragraph */}
      <Text style={styles.para}>
        You caught it. The one that changes everything. That first real,
        full-face, eyes-crinkling moment — and it was meant just for you.
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          onPress={() => router.push('/(tabs)/capture')}
          title="📸 Add a photo of this moment"
        />
        <Button
          onPress={() => router.replace('/(tabs)/')}
          title="Save to scrapbook →"
          variant="outline"
        />
      </View>

      {/* Share row */}
      <View style={styles.shareRow}>
        <TouchableOpacity style={styles.shareIcon} onPress={handleShare}>
          <Text style={{ fontSize: 16 }}>👨‍👩‍👧</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareIcon} onPress={handleShare}>
          <Text style={{ fontSize: 16 }}>💌</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareIcon} onPress={handleShare}>
          <Text style={{ fontSize: 16 }}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Close */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeBtnText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.ink },
  content: {
    alignItems: 'center',
    paddingHorizontal: 28,
    overflow: 'hidden',
  },

  orb1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(193,123,92,0.25)',
    top: -80,
    left: -80,
  },
  orb2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(181,196,177,0.15)',
    bottom: 20,
    right: -40,
  },

  confettiRow: {
    flexDirection: 'row',
    gap: width / 8,
    marginBottom: 24,
    zIndex: 1,
  },

  badge: {
    backgroundColor: Colors.sienna,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 24,
    zIndex: 1,
  },
  badgeText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 9,
    letterSpacing: 1.5,
    color: '#fff',
  },

  bigEmoji: { fontSize: 72, marginBottom: 20, zIndex: 1 },

  title: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 42,
    color: Colors.cream,
    lineHeight: 48,
    textAlign: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  titleItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.rose,
  },

  date: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: 'rgba(251,247,242,0.4)',
    letterSpacing: 1,
    marginBottom: 28,
    zIndex: 1,
  },

  para: {
    fontFamily: 'DMSans_300Light',
    fontSize: 15,
    color: 'rgba(251,247,242,0.65)',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 36,
    zIndex: 1,
    maxWidth: 300,
  },

  actions: { width: '100%', gap: 10, zIndex: 1 },

  shareRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 16,
    zIndex: 1,
  },
  shareIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeBtn: { marginTop: 24, zIndex: 1 },
  closeBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: 'rgba(251,247,242,0.35)',
    textDecorationLine: 'underline',
  },
});
