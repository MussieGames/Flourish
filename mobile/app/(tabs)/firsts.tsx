import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Icon, SectionLabel } from '@/components';
import type { IconName } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useMilestones } from '@/hooks/useBabyData';
import { addCustomMilestone, captureMilestone } from '@/firebase/firestore';
import { iconForFirst } from '@/data/firsts';
import { computeAge } from '@/lib/age';
import { colors, fonts, radius } from '@/theme';
import type { Milestone } from '@/types/models';

export default function Firsts() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, user } = useAuth();
  const { items: milestones } = useMilestones(activeBaby?.id);

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [savingCustom, setSavingCustom] = useState(false);

  const ageWeeks = computeAge(activeBaby?.birthDate)?.weeks ?? 0;

  const isMissed = (m: Milestone) =>
    m.status === 'upcoming' && !!m.typicalWeeksMax && ageWeeks > m.typicalWeeksMax + 2;

  const captured = useMemo(() => milestones.filter((m) => m.status === 'captured'), [milestones]);
  const feature = useMemo(
    () => milestones.find((m) => m.status === 'upcoming' && !isMissed(m)),
    [milestones, ageWeeks],
  );
  const upcoming = useMemo(
    () => milestones.filter((m) => m.status === 'upcoming' && m.id !== feature?.id && !isMissed(m)),
    [milestones, feature, ageWeeks],
  );
  const missed = useMemo(() => milestones.filter(isMissed), [milestones, ageWeeks]);

  const onCapture = async (m: Milestone) => {
    if (!activeBaby) return;
    await captureMilestone(activeBaby.id, m.id);
    router.push({ pathname: '/milestone', params: { id: m.id, key: m.key, label: m.label } });
  };

  const addCustom = async () => {
    if (!activeBaby || !user || !newLabel.trim()) return;
    setSavingCustom(true);
    try {
      await addCustomMilestone(activeBaby.id, user.uid, newLabel);
      setNewLabel('');
      setAdding(false);
    } finally {
      setSavingCustom(false);
    }
  };

  const iconFor = (m: Milestone): IconName => (m.icon as IconName) ?? iconForFirst(m.key);

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
        <LinearGradient
          colors={['rgba(193,123,92,0.2)', 'transparent']}
          start={{ x: 0.7, y: 1 }}
          end={{ x: 0.2, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.heroTop}>
          <AppText variant="display" color={colors.cream}>
            Every <AppText variant="displayItalic" color={colors.rose}>little</AppText> first
          </AppText>
          <AppText variant="caption" color={colors.onDark40}>{captured.length} of {milestones.length}</AppText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${milestones.length ? (captured.length / milestones.length) * 100 : 0}%` }]} />
        </View>
      </View>

      {/* Featured next */}
      {feature ? (
        <Pressable
          style={styles.feature}
          onPress={() => router.push({ pathname: '/milestone', params: { id: feature.id, key: feature.key, label: feature.label, preview: '1' } })}
        >
          <LinearGradient colors={['rgba(193,123,92,0.18)', 'transparent']} start={{ x: 0.3, y: 0.2 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <View style={styles.featureIcon}>
            <Icon name={iconFor(feature)} size={26} color={colors.sienna} />
          </View>
          <AppText variant="label" color={colors.sienna} style={styles.featureEyebrow}>Coming soon · {feature.typicalAge}</AppText>
          <AppText variant="title" color={colors.cream}>{feature.label}</AppText>
          {feature.description ? (
            <AppText variant="serifItalic" color={colors.onDark45} style={styles.featureDesc}>“{feature.description}”</AppText>
          ) : null}
          <View style={styles.readyRow}>
            <Icon name="notifications-outline" size={13} color={colors.sageDark} />
            <AppText variant="caption" color={colors.sageDark}>Camera ready — Flourish will remind you</AppText>
          </View>
        </Pressable>
      ) : null}

      <View style={styles.body}>
        {/* Add your own */}
        {adding ? (
          <View style={styles.addComposer}>
            <TextInput
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="First laugh at the dog…"
              placeholderTextColor={colors.inkMuted}
              autoFocus
              maxLength={80}
              style={styles.addInput}
            />
            <View style={styles.addActions}>
              <View style={styles.flex1}><Button label="Cancel" variant="outline" onPress={() => { setAdding(false); setNewLabel(''); }} /></View>
              <View style={styles.flex1}><Button label="Add first" loading={savingCustom} disabled={!newLabel.trim()} onPress={addCustom} /></View>
            </View>
          </View>
        ) : (
          <Pressable style={styles.addRow} onPress={() => setAdding(true)}>
            <View style={styles.addIcon}><Icon name="add" size={18} color={colors.sienna} /></View>
            <AppText variant="caption" color={colors.inkLight} style={styles.flex1}>
              Add your own — first laugh at the dog, first reach for your face…
            </AppText>
          </Pressable>
        )}

        {upcoming.length > 0 ? <SectionLabel>Coming up</SectionLabel> : null}
        {upcoming.map((m) => (
          <View key={m.id} style={styles.row}>
            <View style={styles.rowIcon}><Icon name={iconFor(m)} size={20} color={colors.inkMuted} /></View>
            <View style={styles.flex1}>
              <AppText variant="bodyMedium">{m.label}</AppText>
              <AppText variant="caption">{m.typicalAge}</AppText>
            </View>
            <Pressable style={styles.markBtn} onPress={() => onCapture(m)}>
              <AppText variant="label" color={colors.white} style={styles.markLabel}>Caught</AppText>
            </Pressable>
          </View>
        ))}

        {captured.length > 0 ? <View style={styles.gap}><SectionLabel color={colors.sageDark}>Caught</SectionLabel></View> : null}
        {captured.map((m) => (
          <Pressable
            key={m.id}
            style={[styles.row, styles.rowDone]}
            onPress={() => router.push({ pathname: '/milestone', params: { id: m.id, key: m.key, label: m.label } })}
          >
            <View style={[styles.rowIcon, styles.rowIconDone]}><Icon name={iconFor(m)} size={20} color={colors.sageDark} /></View>
            <View style={styles.flex1}>
              <AppText variant="bodyMedium">{m.label}</AppText>
              <AppText variant="caption" color={colors.sageDark}>Caught</AppText>
            </View>
            <Icon name="checkmark-circle" size={22} color={colors.sageDark} />
          </Pressable>
        ))}

        {missed.length > 0 ? <View style={styles.gap}><SectionLabel color={colors.inkMuted}>Passed — but not lost</SectionLabel></View> : null}
        {missed.map((m) => (
          <View key={m.id} style={styles.row}>
            <View style={styles.rowIcon}><Icon name={iconFor(m)} size={20} color={colors.inkMuted} /></View>
            <View style={styles.flex1}>
              <AppText variant="bodyMedium">{m.label}</AppText>
              <AppText variant="caption" style={styles.missedNote}>That’s okay — write what you remember. Even one sentence.</AppText>
            </View>
            <Pressable
              style={styles.writeBtn}
              onPress={() => router.push({ pathname: '/journal-entry', params: { prompt: `What do you remember about ${activeBaby?.name ?? 'their'} ${m.label.toLowerCase()}?`, milestone: m.label } })}
            >
              <AppText variant="label" color={colors.sienna} style={styles.markLabel}>Write it</AppText>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  hero: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingBottom: 22, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(251,247,242,0.12)', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.sienna },
  feature: {
    backgroundColor: colors.ink,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(193,123,92,0.2)',
    overflow: 'hidden',
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(193,123,92,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  featureEyebrow: { marginBottom: 4 },
  featureDesc: { marginTop: 8, fontSize: 13, lineHeight: 20 },
  readyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  body: { padding: 20, paddingBottom: 40 },
  addComposer: { marginBottom: 16 },
  addInput: {
    backgroundColor: colors.warm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.body, fontSize: 14, color: colors.ink,
  },
  addActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(196,169,160,0.4)', borderStyle: 'dashed',
    borderRadius: radius.md, padding: 14, marginBottom: 20,
  },
  addIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(193,123,92,0.1)', alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.warm, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 14, marginBottom: 10,
  },
  rowDone: { backgroundColor: 'rgba(122,158,126,0.08)', borderColor: 'rgba(122,158,126,0.25)' },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(140,120,112,0.08)', alignItems: 'center', justifyContent: 'center' },
  rowIconDone: { backgroundColor: 'rgba(122,158,126,0.15)' },
  gap: { marginTop: 14 },
  markBtn: { backgroundColor: colors.sienna, paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.sm },
  writeBtn: { borderWidth: 1, borderColor: 'rgba(193,123,92,0.4)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm },
  markLabel: { letterSpacing: 1 },
  missedNote: { lineHeight: 16 },
});
