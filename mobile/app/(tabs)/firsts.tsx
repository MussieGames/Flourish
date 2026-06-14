import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Hero, SectionLabel } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useMilestones } from '@/hooks/useBabyData';
import { captureMilestone } from '@/firebase/firestore';
import { colors, radius } from '@/theme';
import type { Milestone } from '@/types/models';

export default function Firsts() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby } = useAuth();
  const { items: milestones } = useMilestones(activeBaby?.id);

  const captured = useMemo(() => milestones.filter((m) => m.status === 'captured'), [milestones]);
  const upcoming = useMemo(() => milestones.filter((m) => m.status === 'upcoming'), [milestones]);

  const onCapture = async (m: Milestone) => {
    if (!activeBaby) return;
    await captureMilestone(activeBaby.id, m.id);
    router.push({
      pathname: '/milestone',
      params: { id: m.id, emoji: m.emoji, label: m.label },
    });
  };

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <Hero paddingTop={insets.top + 20} glow="rgba(193,123,92,0.2)">
        <AppText variant="label">The firsts</AppText>
        <AppText variant="display" color={colors.cream}>
          Every{' '}
          <AppText variant="displayItalic" color={colors.rose}>
            little
          </AppText>{' '}
          first
        </AppText>
        <AppText variant="caption" color={colors.onDark45} style={styles.sub}>
          {captured.length} of {milestones.length} captured
        </AppText>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${milestones.length ? (captured.length / milestones.length) * 100 : 0}%` },
            ]}
          />
        </View>
      </Hero>

      <View style={styles.body}>
        <SectionLabel>Coming up</SectionLabel>
        {upcoming.map((m) => (
          <View key={m.id} style={styles.row}>
            <AppText style={styles.emoji}>{m.emoji}</AppText>
            <View style={styles.flex1}>
              <AppText variant="bodyMedium">{m.label}</AppText>
              <AppText variant="caption">{m.typicalAge}</AppText>
            </View>
            <Pressable style={styles.markBtn} onPress={() => onCapture(m)}>
              <AppText variant="label" color={colors.white} style={styles.markLabel}>
                Mark
              </AppText>
            </Pressable>
          </View>
        ))}

        {captured.length > 0 ? (
          <View style={styles.capturedSection}>
            <SectionLabel color={colors.sageDark}>Captured</SectionLabel>
            {captured.map((m) => (
              <Pressable
                key={m.id}
                style={[styles.row, styles.rowDone]}
                onPress={() =>
                  router.push({ pathname: '/milestone', params: { id: m.id, emoji: m.emoji, label: m.label } })
                }
              >
                <AppText style={styles.emoji}>{m.emoji}</AppText>
                <View style={styles.flex1}>
                  <AppText variant="bodyMedium">{m.label}</AppText>
                  <AppText variant="caption" color={colors.sageDark}>
                    Captured
                  </AppText>
                </View>
                <Ionicons name="checkmark-circle" size={22} color={colors.sageDark} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  sub: { marginTop: 6, marginBottom: 12 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(251,247,242,0.12)',
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.sienna },
  body: { padding: 20, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
  },
  rowDone: { backgroundColor: 'rgba(122,158,126,0.08)', borderColor: 'rgba(122,158,126,0.25)' },
  emoji: { fontSize: 26 },
  markBtn: {
    backgroundColor: colors.sienna,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  markLabel: { letterSpacing: 1 },
  capturedSection: { marginTop: 24 },
});
