/**
 * Dashboard — post sign-in home screen.
 * Displays greeting, milestone alert, quick capture, memory grid, firsts tracker.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useBaby } from '../../src/hooks/useBaby';
import { getMemoriesForBaby, getMilestonesForBaby } from '../../src/services/firestore';
import { Colors, Typography, Spacing, Shadows } from '../../src/constants/theme';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import type { Memory, Milestone } from '../../src/types';
import { MILESTONE_TEMPLATES } from '../../src/constants/stickers';

const MEMORY_COLORS = [
  ['#E8C4B0', '#C4907A'],
  ['#C5D4C0', '#A8BFA8'],
  ['#E8D5B0', '#D4B880'],
  ['#D4C4D8', '#B4A0C0'],
] as const;

const MEMORY_EMOJIS = ['🍼', '😴', '👣', '🤱', '📸', '🌿', '💛', '⭐'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeBaby, ageInfo, loading: babyLoading } = useBaby(user?.uid ?? null);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!user?.uid || !activeBaby) return;
    setLoadingData(true);
    Promise.all([
      getMemoriesForBaby(user.uid, activeBaby.id, 4),
      getMilestonesForBaby(user.uid, activeBaby.id),
    ])
      .then(([mems, miles]) => {
        setMemories(mems);
        setMilestones(miles);
      })
      .finally(() => setLoadingData(false));
  }, [user?.uid, activeBaby]);

  const upcomingMilestone = MILESTONE_TEMPLATES.find(
    (t) => !milestones.find((m) => m.type === t.id && m.isCaptured)
  );

  const firstsToShow = MILESTONE_TEMPLATES.slice(0, 6).map((t) => ({
    ...t,
    done: !!milestones.find((m) => m.type === t.id && m.isCaptured),
  }));

  if (babyLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.sienna} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Dark top header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <LinearGradient
          colors={['rgba(193,123,92,0.2)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>
          {activeBaby?.name ?? 'Your'}'s{' '}
          <Text style={styles.nameItalic}>World</Text>
        </Text>
        <Text style={styles.age}>
          {ageInfo?.displayAge ?? 'Welcome to Flourish'}{' '}
          {activeBaby
            ? `· Born ${activeBaby.birthDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}`
            : ''}
        </Text>
      </View>

      {/* Milestone alert */}
      {upcomingMilestone && (
        <TouchableOpacity
          style={styles.milestoneAlert}
          onPress={() => router.push('/(tabs)/firsts')}
          activeOpacity={0.85}
        >
          <Text style={styles.alertIcon}>{upcomingMilestone.emoji}</Text>
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>{upcomingMilestone.title} is coming</Text>
            <Text style={styles.alertSub}>
              Expected around {upcomingMilestone.expectedAgeLabel}. Keep your camera ready.
            </Text>
          </View>
          <Text style={styles.alertArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Quick capture */}
      <View style={styles.section}>
        <EyebrowLabel>Capture a moment</EyebrowLabel>
        <View style={styles.captureRow}>
          {[
            { icon: '📸', label: 'Photo', route: '/(tabs)/capture' },
            { icon: '🎥', label: 'Video', route: '/(tabs)/capture' },
            { icon: '✍️', label: 'Journal', route: '/journal/new' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.captureBtn}
              onPress={() => router.push(item.route as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.captureIcon}>{item.icon}</Text>
              <Text style={styles.captureLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent memories grid */}
      <View style={styles.section}>
        <EyebrowLabel>Recent memories</EyebrowLabel>
        {loadingData ? (
          <ActivityIndicator color={Colors.sienna} style={{ paddingVertical: 20 }} />
        ) : memories.length > 0 ? (
          <View style={styles.memoryGrid}>
            {memories.slice(0, 4).map((mem, i) => (
              <TouchableOpacity
                key={mem.id}
                style={styles.memCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/scrapbook')}
              >
                <LinearGradient
                  colors={MEMORY_COLORS[i % MEMORY_COLORS.length] as unknown as [string, string]}
                  style={styles.memPhoto}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.memEmoji}>
                    {MEMORY_EMOJIS[i % MEMORY_EMOJIS.length]}
                  </Text>
                  {i === 0 && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  )}
                </LinearGradient>
                <View style={styles.memMeta}>
                  <Text style={styles.memTitle} numberOfLines={1}>
                    {mem.title}
                  </Text>
                  <Text style={styles.memDate}>
                    {mem.capturedAt.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyMemories}>
            <Text style={styles.emptyIcon}>📸</Text>
            <Text style={styles.emptyText}>
              No memories yet. Capture your first moment.
            </Text>
          </View>
        )}
      </View>

      {/* Firsts tracker */}
      <View style={styles.section}>
        <EyebrowLabel>Firsts tracker</EyebrowLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.firstsStrip}
        >
          {firstsToShow.map((first) => (
            <TouchableOpacity
              key={first.id}
              style={[styles.firstChip, first.done && styles.firstChipDone]}
              onPress={() => router.push('/(tabs)/firsts')}
              activeOpacity={0.8}
            >
              <Text style={styles.firstEmoji}>{first.emoji}</Text>
              <View>
                <Text style={styles.firstName}>{first.title}</Text>
                <Text style={styles.firstAge}>{first.expectedAgeLabel}</Text>
              </View>
              {first.done && <Text style={styles.firstTick}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream },

  // Header
  header: {
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    overflow: 'hidden',
  },
  greeting: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(251,247,242,0.4)',
    marginBottom: 6,
  },
  name: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 32,
    color: Colors.cream,
    lineHeight: 38,
    marginBottom: 4,
  },
  nameItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.rose,
  },
  age: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: 'rgba(251,247,242,0.45)',
  },

  // Milestone alert
  milestoneAlert: {
    backgroundColor: Colors.sienna,
    marginHorizontal: Spacing.xl,
    marginTop: -1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  alertIcon: { fontSize: 20 },
  alertText: { flex: 1 },
  alertTitle: { fontFamily: 'DMSans_500Medium', fontSize: Typography.sizes.sm, color: '#fff' },
  alertSub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  alertArrow: { fontSize: 18, color: 'rgba(255,255,255,0.6)' },

  // Section
  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'] },

  // Quick capture
  captureRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing['2xl'] },
  captureBtn: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    backgroundColor: Colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.25)',
    alignItems: 'center',
    gap: 6,
    borderRadius: 2,
  },
  captureIcon: { fontSize: 22 },
  captureLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs - 1,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkLight,
  },

  // Memory grid
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing['2xl'],
  },
  memCard: {
    width: '47.5%',
    backgroundColor: Colors.warm,
    borderRadius: 4,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  memPhoto: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  memEmoji: { fontSize: 32 },
  newBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.sienna,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  newBadgeText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 7,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#fff',
  },
  memMeta: { padding: 10 },
  memTitle: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: Colors.ink },
  memDate: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.inkMedium, marginTop: 2 },

  emptyMemories: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: { fontSize: 32, opacity: 0.4 },
  emptyText: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: Typography.sizes.lg,
    color: Colors.inkMedium,
    textAlign: 'center',
  },

  // Firsts strip
  firstsStrip: { gap: 10, paddingBottom: 8, paddingRight: Spacing.xl },
  firstChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warm,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.25)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 40,
  },
  firstChipDone: {
    backgroundColor: 'rgba(122,158,126,0.1)',
    borderColor: 'rgba(122,158,126,0.3)',
  },
  firstEmoji: { fontSize: 18 },
  firstName: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: Colors.ink },
  firstAge: { fontFamily: 'DMSans_400Regular', fontSize: 9, color: Colors.inkMedium },
  firstTick: { fontSize: 14, color: Colors.sageDark, marginLeft: 4 },
});
