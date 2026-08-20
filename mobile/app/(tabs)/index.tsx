import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Icon, SectionLabel } from '@/components';
import { MemoryThumb } from '@/components/MemoryThumb';
import { useAuth } from '@/context/AuthContext';
import { useMemories, useMilestones } from '@/hooks/useBabyData';
import { iconForFirst } from '@/data/firsts';
import { dailyPrompt } from '@/data/prompts';
import { computeAge } from '@/lib/age';
import { formatRelative, tsToDate, warmGreeting } from '@/lib/format';
import { colors, radius } from '@/theme';
import type { IconName } from '@/components';

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, emailVerified, resendVerification } = useAuth();

  const { items: memories } = useMemories(activeBaby?.id);
  const { items: milestones } = useMilestones(activeBaby?.id);

  const age = useMemo(() => computeAge(activeBaby?.birthDate), [activeBaby?.birthDate]);
  const nextMilestone = useMemo(() => milestones.find((m) => m.status === 'upcoming'), [milestones]);
  const capturedCount = useMemo(() => milestones.filter((m) => m.status === 'captured').length, [milestones]);
  const recent = memories.slice(0, 4);
  const prompt = useMemo(() => dailyPrompt(activeBaby?.name), [activeBaby?.name]);
  const name = activeBaby?.name ?? 'your baby';

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
        <LinearGradient
          colors={['rgba(193,123,92,0.2)', 'transparent']}
          start={{ x: 0.8, y: 1 }}
          end={{ x: 0.2, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Pressable style={[styles.profileBtn, { top: insets.top + 14 }]} hitSlop={10} onPress={() => router.push('/profile')}>
          <Icon name="person-circle-outline" size={28} color={colors.onDark45} />
        </Pressable>
        <AppText variant="caption" color={colors.onDark45} style={styles.greeting}>
          {warmGreeting()}
        </AppText>
        <AppText variant="display" color={colors.cream}>
          {name}&apos;s{' '}
          <AppText variant="displayItalic" color={colors.rose}>story</AppText>
        </AppText>
        {age ? (
          <View style={styles.ageChip}>
            <Icon name="leaf-outline" size={11} color={colors.sage} />
            <AppText variant="caption" color={colors.onDark45}>{age.label}</AppText>
          </View>
        ) : null}

        {nextMilestone ? (
          <Pressable
            style={styles.alert}
            onPress={() =>
              router.push({
                pathname: '/milestone',
                params: { id: nextMilestone.id, key: nextMilestone.key, label: nextMilestone.label, preview: '1' },
              })
            }
          >
            <AppText variant="label" color={colors.sienna} style={styles.alertEyebrow}>
              Milestone coming
            </AppText>
            <AppText variant="bodyMedium" color={colors.cream}>{nextMilestone.label} is near</AppText>
            <AppText variant="caption" color={colors.onDark40} style={styles.alertSub}>
              {nextMilestone.typicalAge} · keep your camera ready
            </AppText>
            <View style={styles.alertTapRow}>
              <AppText variant="caption" color={colors.sienna}>Tap to learn more</AppText>
              <Icon name="arrow-forward" size={12} color={colors.sienna} />
            </View>
          </Pressable>
        ) : null}
      </View>

      {!emailVerified ? (
        <Pressable onPress={() => resendVerification().catch(() => {})} style={styles.verifyBanner}>
          <Icon name="mail-unread-outline" size={18} color={colors.gold} />
          <AppText variant="caption" color={colors.inkLight} style={styles.verifyText}>
            Please verify your email to secure your account. Tap to resend.
          </AppText>
        </Pressable>
      ) : null}

      {/* Daily journal prompt */}
      <Pressable
        style={styles.promptCard}
        onPress={() => router.push({ pathname: '/journal-entry', params: { prompt } })}
      >
        <AppText variant="serifItalic" color={colors.inkLight} style={styles.promptText}>
          “{prompt}”
        </AppText>
        <View style={styles.promptTapRow}>
          <AppText variant="label" color={colors.sienna}>Write in journal</AppText>
          <Icon name="arrow-forward" size={12} color={colors.sienna} />
        </View>
      </Pressable>

      <View style={styles.section}>
        <SectionLabel>Capture a moment</SectionLabel>
        <View style={styles.quickRow}>
          <QuickButton icon="camera-outline" label="Photo" onPress={() => router.push('/(tabs)/capture')} highlight />
          <QuickButton icon="videocam-outline" label="Video" onPress={() => router.push('/(tabs)/capture')} />
          <QuickButton icon="create-outline" label="Journal" onPress={() => router.push('/journal-entry')} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionLabel>Recent memories</SectionLabel>
        {recent.length === 0 ? (
          <AppText variant="caption" style={styles.empty}>
            No memories yet — tap a capture button above to keep your first one.
          </AppText>
        ) : (
          <View style={styles.memGrid}>
            {recent.map((mem, i) => (
              <Pressable key={mem.id} style={styles.memCard} onPress={() => router.push('/(tabs)/scrapbook')}>
                <MemoryThumb storagePath={mem.storagePath} kind={mem.kind} index={i} />
                <View style={styles.memMeta}>
                  <AppText variant="bodyMedium" numberOfLines={1}>{mem.title}</AppText>
                  <AppText variant="caption">{formatRelative(tsToDate(mem.createdAt))}</AppText>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Firsts tracker */}
      <View style={[styles.section, styles.lastSection]}>
        <SectionLabel>Firsts tracker</SectionLabel>
        <Pressable style={styles.tracker} onPress={() => router.push('/(tabs)/firsts')}>
          <View style={styles.trackerTop}>
            <AppText variant="bodyMedium">Every little first</AppText>
            <AppText variant="caption" color={colors.sienna}>
              {capturedCount} of {milestones.length} caught
            </AppText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.firstsRow}>
            {milestones.slice(0, 8).map((m) => {
              const done = m.status === 'captured';
              return (
                <View key={m.id} style={[styles.firstDot, done && styles.firstDotDone, !done && m.id === nextMilestone?.id && styles.firstDotNext]}>
                  <Icon
                    name={(m.icon as IconName) ?? iconForFirst(m.key)}
                    size={15}
                    color={done ? colors.sageDark : m.id === nextMilestone?.id ? colors.sienna : colors.inkMuted}
                  />
                </View>
              );
            })}
          </ScrollView>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function QuickButton({
  icon,
  label,
  onPress,
  highlight,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickBtn, highlight && styles.quickHighlight, pressed && styles.pressed]}>
      <Icon name={icon} size={24} color={colors.sienna} />
      <AppText variant="label" color={colors.inkLight} style={styles.quickLabel}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  hero: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingBottom: 22, overflow: 'hidden' },
  profileBtn: { position: 'absolute', right: 20, zIndex: 5 },
  greeting: { marginBottom: 8, lineHeight: 18, paddingRight: 40 },
  ageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  alert: {
    backgroundColor: 'rgba(193,123,92,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(193,123,92,0.28)',
    borderRadius: radius.sm,
    padding: 14,
    marginTop: 16,
  },
  alertEyebrow: { marginBottom: 4 },
  alertSub: { marginTop: 2 },
  alertTapRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(201,169,110,0.14)',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  verifyText: { flex: 1, lineHeight: 16 },
  promptCard: {
    backgroundColor: colors.warm,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(193,123,92,0.4)',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: radius.sm,
  },
  promptText: { fontSize: 15, lineHeight: 24 },
  promptTapRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  lastSection: { paddingBottom: 36 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.25)',
    borderRadius: radius.sm,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  quickHighlight: { borderColor: 'rgba(193,123,92,0.4)' },
  quickLabel: { letterSpacing: 0.8 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  empty: { lineHeight: 18 },
  memGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memCard: { width: '48.5%', backgroundColor: colors.warm, borderRadius: radius.md, overflow: 'hidden' },
  memMeta: { paddingHorizontal: 12, paddingVertical: 10 },
  tracker: {
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
  },
  trackerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  firstsRow: { gap: 8, paddingRight: 4 },
  firstDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(140,120,112,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstDotDone: { backgroundColor: 'rgba(122,158,126,0.15)' },
  firstDotNext: { backgroundColor: 'rgba(193,123,92,0.15)' },
});
