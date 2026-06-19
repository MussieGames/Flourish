/**
 * Dashboard — the first screen a parent sees after sign-in.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useBabyContext } from '../../src/contexts/BabyContext';
import { getMemoriesForBaby, getMilestonesForBaby } from '../../src/services/firestore';
import { getAgeAwareGreeting } from '../../src/utils/greeting';
import { trackChildSwitched, trackMemoryViewed } from '../../src/services/analytics';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import { MemoryThumbnail } from '../../src/components/MemoryThumbnail';
import type { Memory, Milestone } from '../../src/types';
import { MILESTONE_TEMPLATES } from '../../src/constants/stickers';

// ─── Profile setup nudge — shown when no baby profile exists ─────────────────
function ProfileSetupCard({ onSetup }: { onSetup: () => void }) {
  return (
    <TouchableOpacity style={profileCard.container} onPress={onSetup} activeOpacity={0.85}>
      <View style={profileCard.icon}><Text style={{ fontSize: 28 }}>🌿</Text></View>
      <View style={profileCard.text}>
        <Text style={profileCard.title}>Set up your baby's profile</Text>
        <Text style={profileCard.sub}>Add their name and birthday to start tracking milestones and capturing memories.</Text>
      </View>
      <Text style={profileCard.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const profileCard = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    margin: Spacing.xl, padding: Spacing.xl,
    backgroundColor: Colors.warm, borderWidth: 1.5,
    borderColor: Colors.sienna, borderRadius: 4,
  },
  icon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(193,123,92,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { fontFamily: 'DMSans_500Medium', fontSize: Typography.sizes.md, color: Colors.ink, marginBottom: 3 },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.inkMedium, lineHeight: 17 },
  arrow: { fontSize: 20, color: Colors.sienna },
});

// ─── Child switcher — shown when user has more than one baby ─────────────────
function ChildSwitcher({
  babies,
  activeBaby,
  onSwitch,
}: {
  babies: import('../../src/types').Baby[];
  activeBaby: import('../../src/types').Baby | null;
  onSwitch: (baby: import('../../src/types').Baby) => void;
}) {
  if (babies.length <= 1) return null;
  return (
    <View style={switcher.strip}>
      {babies.map((baby) => (
        <TouchableOpacity
          key={baby.id}
          style={[switcher.chip, activeBaby?.id === baby.id && switcher.chipActive]}
          onPress={() => onSwitch(baby)}
          activeOpacity={0.8}
        >
          <Text style={[switcher.name, activeBaby?.id === baby.id && switcher.nameActive]}>
            {baby.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const switcher = StyleSheet.create({
  strip: {
    flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.xl,
    paddingVertical: 12, backgroundColor: Colors.warm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(196,169,160,0.2)',
  },
  chip: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(196,169,160,0.3)',
  },
  chipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  name: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.inkMedium },
  nameActive: { color: Colors.cream, fontFamily: 'DMSans_500Medium' },
});

// ─── Empty memories state ─────────────────────────────────────────────────────
function EmptyMemoriesState({ onCapture }: { onCapture: () => void }) {
  return (
    <TouchableOpacity style={styles.emptyState} onPress={onCapture} activeOpacity={0.85}>
      <Text style={styles.emptyStateEmoji}>🌿</Text>
      <Text style={styles.emptyStateTitle}>Your story starts here.</Text>
      <Text style={styles.emptyStateSub}>
        Every photo, every note, every tiny detail — preserved forever. Tap to
        capture your first moment together.
      </Text>
      <View style={styles.emptyStateCta}>
        <Text style={styles.emptyStateCtaText}>CAPTURE FIRST MOMENT →</Text>
      </View>
    </TouchableOpacity>
  );
}

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>
        Couldn't load memories right now. Check your connection.
      </Text>
      <TouchableOpacity onPress={onRetry}>
        <Text style={styles.errorRetry}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { babies, activeBaby, ageInfo, loading: babyLoading, error: babyError, refresh, setActiveBaby } = useBabyContext();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.uid || !activeBaby?.id) return;
    setLoadingData(true);
    setDataError(null);
    try {
      const [mems, miles] = await Promise.all([
        getMemoriesForBaby(user.uid, activeBaby.id, 4),
        getMilestonesForBaby(user.uid, activeBaby.id),
      ]);
      setMemories(mems);
      setMilestones(miles);
    } catch (err) {
      setDataError((err as Error).message);
    } finally {
      setLoadingData(false);
    }
  }, [user?.uid, activeBaby?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), fetchData()]);
    setRefreshing(false);
  };

  const firstName = user?.displayName?.split(' ')[0] ?? '';
  const { timeGreeting, warmth } = getAgeAwareGreeting(firstName, ageInfo?.ageInWeeks ?? null);

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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.sienna} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <LinearGradient
          colors={['rgba(193,123,92,0.2)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
        <Text style={styles.greeting}>{timeGreeting}</Text>
        <Text style={styles.name}>
          {activeBaby?.name ?? 'Your'}'s <Text style={styles.nameItalic}>World</Text>
        </Text>
        <Text style={styles.age}>
          {ageInfo?.displayAge ?? "Set up your baby's profile to begin"}
          {activeBaby
            ? ` · Born ${activeBaby.birthDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
            : ''}
        </Text>
        {/* Age-aware warmth line — only shown when relevant */}
        {warmth && <Text style={styles.warmth}>{warmth}</Text>}
      </View>

      {/* Profile setup nudge — only when no baby yet */}
      {!activeBaby && !babyLoading && (
        <ProfileSetupCard onSetup={() => router.push('/(auth)/welcome')} />
      )}

      {/* Child switcher — only when 2+ children */}
      <ChildSwitcher
        babies={babies}
        activeBaby={activeBaby}
        onSwitch={(baby) => {
          setActiveBaby(baby);
          trackChildSwitched();
        }}
      />

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

      {(babyError || dataError) && (
        <ErrorBanner onRetry={handleRefresh} />
      )}

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

      <View style={styles.section}>
        <EyebrowLabel>Recent memories</EyebrowLabel>
        {loadingData ? (
          <ActivityIndicator color={Colors.sienna} style={{ paddingVertical: 20 }} />
        ) : memories.length > 0 ? (
          <View style={styles.memoryGrid}>
            {memories.map((mem, i) => (
              <TouchableOpacity
                key={mem.id}
                style={styles.memCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/scrapbook')}
              >
                <MemoryThumbnail memory={mem} index={i} height={90} />
                {i === 0 && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}
                <View style={styles.memMeta}>
                  <Text style={styles.memTitle} numberOfLines={1}>{mem.title}</Text>
                  <Text style={styles.memDate}>
                    {mem.capturedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyMemoriesState onCapture={() => router.push('/(tabs)/capture')} />
        )}
      </View>

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

  header: {
    backgroundColor: Colors.ink, paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'], overflow: 'hidden',
  },
  greeting: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm,
    letterSpacing: 0.5, color: 'rgba(251,247,242,0.4)', marginBottom: 6,
  },
  name: {
    fontFamily: 'CormorantGaramond_300Light', fontSize: 32,
    color: Colors.cream, lineHeight: 38, marginBottom: 4,
  },
  nameItalic: { fontFamily: 'CormorantGaramond_300Light_Italic', color: Colors.rose },
  age: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm, color: 'rgba(251,247,242,0.45)' },
  warmth: {
    fontFamily: 'CormorantGaramond_300Light_Italic', fontSize: 16,
    color: 'rgba(193,123,92,0.85)', marginTop: 8,
  },

  milestoneAlert: {
    backgroundColor: Colors.sienna, marginHorizontal: Spacing.xl, marginTop: -1,
    paddingVertical: 14, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 2,
  },
  alertIcon: { fontSize: 20 },
  alertText: { flex: 1 },
  alertTitle: { fontFamily: 'DMSans_500Medium', fontSize: Typography.sizes.sm, color: '#fff' },
  alertSub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  alertArrow: { fontSize: 18, color: 'rgba(255,255,255,0.6)' },

  errorBanner: {
    margin: Spacing.xl, padding: Spacing.md,
    backgroundColor: 'rgba(229,115,115,0.1)', borderLeftWidth: 2, borderLeftColor: '#e57373',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  errorText: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: '#c62828', lineHeight: 18 },
  errorRetry: { fontFamily: 'DMSans_500Medium', fontSize: Typography.sizes.xs, color: Colors.sienna, textDecorationLine: 'underline' },

  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'] },

  captureRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing['2xl'] },
  captureBtn: {
    flex: 1, paddingVertical: 18, paddingHorizontal: 12,
    backgroundColor: Colors.warm, borderWidth: 1.5, borderColor: 'rgba(196,169,160,0.25)',
    alignItems: 'center', gap: 6, borderRadius: 2,
  },
  captureIcon: { fontSize: 22 },
  captureLabel: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs - 1,
    letterSpacing: 0.6, textTransform: 'uppercase', color: Colors.inkLight,
  },

  memoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing['2xl'] },
  memCard: {
    width: '47.5%', backgroundColor: Colors.warm, borderRadius: 4, overflow: 'hidden',
    shadowColor: '#2C2420', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 2, position: 'relative',
  },
  newBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: Colors.sienna, paddingVertical: 2, paddingHorizontal: 6,
    borderRadius: 10, zIndex: 1,
  },
  newBadgeText: { fontFamily: 'DMSans_400Regular', fontSize: 7, letterSpacing: 0.5, textTransform: 'uppercase', color: '#fff' },
  memMeta: { padding: 10 },
  memTitle: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: Colors.ink },
  memDate: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.inkMedium, marginTop: 2 },

  emptyState: {
    backgroundColor: Colors.warm, borderWidth: 1, borderColor: 'rgba(196,169,160,0.2)',
    padding: Spacing['3xl'], marginBottom: Spacing['2xl'], alignItems: 'center', gap: 10,
  },
  emptyStateEmoji: { fontSize: 36, marginBottom: 4 },
  emptyStateTitle: { fontFamily: 'CormorantGaramond_300Light_Italic', fontSize: 22, color: Colors.ink, textAlign: 'center' },
  emptyStateSub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm, color: Colors.inkMedium, textAlign: 'center', lineHeight: 20 },
  emptyStateCta: { marginTop: 8, paddingVertical: 10, paddingHorizontal: Spacing.xl, backgroundColor: Colors.sienna, borderRadius: 2 },
  emptyStateCtaText: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, letterSpacing: 1.2, color: '#fff' },

  firstsStrip: { gap: 10, paddingBottom: 8, paddingRight: Spacing.xl },
  firstChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.warm, borderWidth: 1, borderColor: 'rgba(196,169,160,0.25)',
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 40,
  },
  firstChipDone: { backgroundColor: 'rgba(122,158,126,0.1)', borderColor: 'rgba(122,158,126,0.3)' },
  firstEmoji: { fontSize: 18 },
  firstName: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: Colors.ink },
  firstAge: { fontFamily: 'DMSans_400Regular', fontSize: 9, color: Colors.inkMedium },
  firstTick: { fontSize: 14, color: Colors.sageDark, marginLeft: 4 },
});
