import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Hero, SectionLabel } from '@/components';
import { MemoryThumb } from '@/components/MemoryThumb';
import { useAuth } from '@/context/AuthContext';
import { useMemories, useMilestones } from '@/hooks/useBabyData';
import { computeAge, formatLongDate, parseISODate } from '@/lib/age';
import { formatRelative, greeting, tsToDate } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, emailVerified, resendVerification } = useAuth();

  const { items: memories } = useMemories(activeBaby?.id);
  const { items: milestones } = useMilestones(activeBaby?.id);

  const age = useMemo(() => computeAge(activeBaby?.birthDate), [activeBaby?.birthDate]);
  const birth = parseISODate(activeBaby?.birthDate);
  const nextMilestone = useMemo(
    () => milestones.find((m) => m.status === 'upcoming'),
    [milestones],
  );
  const recent = memories.slice(0, 4);
  const firsts = milestones.slice(0, 6);

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <Hero paddingTop={insets.top + 20} glow="rgba(193,123,92,0.2)" style={styles.hero}>
        <AppText variant="caption" color={colors.onDark40} style={styles.greeting}>
          {greeting().toUpperCase()}
        </AppText>
        <AppText variant="display" color={colors.cream}>
          {activeBaby?.name ?? 'Your baby'}&apos;s{' '}
          <AppText variant="displayItalic" color={colors.rose}>
            World
          </AppText>
        </AppText>
        <AppText variant="caption" color={colors.onDark45} style={styles.age}>
          {age ? `${age.label}` : 'Welcome'}
          {birth ? ` · Born ${formatLongDate(birth)}` : ''}
        </AppText>
      </Hero>

      {!emailVerified ? (
        <Pressable onPress={() => resendVerification().catch(() => {})} style={styles.verifyBanner}>
          <Ionicons name="mail-unread-outline" size={18} color={colors.gold} />
          <AppText variant="caption" color={colors.inkLight} style={styles.verifyText}>
            Please verify your email to secure your account. Tap to resend.
          </AppText>
        </Pressable>
      ) : null}

      {nextMilestone ? (
        <Pressable
          style={styles.alert}
          onPress={() =>
            router.push({
              pathname: '/milestone',
              params: { id: nextMilestone.id, emoji: nextMilestone.emoji, label: nextMilestone.label, preview: '1' },
            })
          }
        >
          <AppText style={styles.alertIcon}>⭐</AppText>
          <View style={styles.flex1}>
            <AppText variant="bodyMedium" color={colors.white}>
              {nextMilestone.label} is coming
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.7)">
              Typically {nextMilestone.typicalAge}. Keep your camera ready.
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </Pressable>
      ) : null}

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
            No memories yet — tap a capture button above to save your first one.
          </AppText>
        ) : (
          <View style={styles.memGrid}>
            {recent.map((mem, i) => (
              <Pressable key={mem.id} style={styles.memCard} onPress={() => router.push('/(tabs)/scrapbook')}>
                <MemoryThumb storagePath={mem.storagePath} kind={mem.kind} index={i} />
                <View style={styles.memMeta}>
                  <AppText variant="bodyMedium" numberOfLines={1}>
                    {mem.title}
                  </AppText>
                  <AppText variant="caption">{formatRelative(tsToDate(mem.createdAt))}</AppText>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <SectionLabel>Firsts tracker</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.firstsRow}
        >
          {firsts.map((m) => {
            const done = m.status === 'captured';
            return (
              <Pressable
                key={m.id}
                style={[styles.firstChip, done && styles.firstChipDone]}
                onPress={() => router.push('/(tabs)/firsts')}
              >
                <AppText style={styles.firstEmoji}>{m.emoji}</AppText>
                <View>
                  <AppText variant="bodyMedium" style={styles.firstName}>
                    {m.label}
                  </AppText>
                  <AppText variant="caption" style={styles.firstAge}>
                    {done ? 'Captured' : m.typicalAge}
                  </AppText>
                </View>
                {done ? <Ionicons name="checkmark" size={16} color={colors.sageDark} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
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
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickBtn, highlight && styles.quickHighlight, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={24} color={colors.sienna} />
      <AppText variant="label" color={colors.inkLight} style={styles.quickLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  hero: { paddingBottom: 28 },
  greeting: { letterSpacing: 1, marginBottom: 6 },
  age: { marginTop: 6 },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(201,169,110,0.14)',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  verifyText: { flex: 1, lineHeight: 16 },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.sienna,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.sm,
  },
  alertIcon: { fontSize: 20 },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  lastSection: { paddingBottom: 32 },
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
  memCard: {
    width: '48.5%',
    backgroundColor: colors.warm,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  memMeta: { paddingHorizontal: 12, paddingVertical: 10 },
  firstsRow: { gap: 10, paddingRight: 20, paddingBottom: 4 },
  firstChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  firstChipDone: {
    backgroundColor: 'rgba(122,158,126,0.1)',
    borderColor: 'rgba(122,158,126,0.3)',
  },
  firstEmoji: { fontSize: 18 },
  firstName: { fontSize: 11 },
  firstAge: { fontSize: 9, fontFamily: fonts.body, color: colors.inkMuted },
});
