import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, EmptyState, Icon } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useJournal } from '@/hooks/useBabyData';
import { dailyPrompt } from '@/data/prompts';
import { daysOldLabel, formatLongDate, weekdayName } from '@/lib/age';
import { formatTime, tsToDate } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';
import type { Baby, JournalEntry } from '@/types/models';

export default function Journal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, isOwner } = useAuth();
  const { items: entries, loading } = useJournal(isOwner ? activeBaby?.id : undefined);
  const prompt = useMemo(() => dailyPrompt(activeBaby?.name), [activeBaby?.name]);
  const name = activeBaby?.name ?? 'Baby';

  if (activeBaby && !isOwner) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
        <LinearGradient
          colors={['rgba(193,123,92,0.16)', 'transparent']}
          start={{ x: 0.8, y: 1 }}
          end={{ x: 0.2, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <AppText variant="display" color={colors.cream}>
          {name}&apos;s <AppText variant="displayItalic" color={colors.rose}>journal</AppText>
        </AppText>
        <View style={styles.privateRow}>
          <Icon name="lock-closed-outline" size={11} color={colors.onDark40} />
          <AppText variant="caption" color={colors.onDark40}>Private · only you will ever read this</AppText>
        </View>
      </View>

      {/* Prompt-led composer */}
      <Pressable style={styles.composer} onPress={() => router.push({ pathname: '/journal-entry', params: { prompt } })}>
        <AppText variant="label" color={colors.sienna} style={styles.promptLabel}>{prompt}</AppText>
        <AppText variant="serifItalic" color={colors.inkMuted} style={styles.composerGhost}>
          Tap to write what you’re feeling right now…
        </AppText>
        <View style={styles.composerFoot}>
          <View style={styles.typePill}>
            <Icon name="create-outline" size={12} color={colors.sienna} />
            <AppText variant="caption" color={colors.sienna}>Text</AppText>
          </View>
        </View>
      </Pressable>

      <View style={styles.body}>
        {entries.length === 0 && !loading ? (
          <EmptyState
            icon="create-outline"
            title="Nothing written yet"
            subtitle="Write down the feeling, the smell, the 3am thought you know you’ll forget."
          />
        ) : (
          <>
            <AppText variant="label" color={colors.inkMuted} style={styles.pastLabel}>Earlier entries</AppText>
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} baby={activeBaby} />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function EntryCard({ entry, baby }: { entry: JournalEntry; baby: Baby | null }) {
  const date = tsToDate(entry.createdAt);
  const days = date ? daysOldLabel(baby?.birthDate, date) : null;
  const meta = date
    ? `${weekdayName(date)} · ${formatTime(date)}${days ? ` · ${baby?.name ?? 'Baby'} is ${days}` : ''}`
    : '';
  return (
    <View style={styles.entry}>
      <AppText variant="label" color={colors.sienna} style={styles.entryDate}>
        {date ? formatLongDate(date) : ''}
      </AppText>
      <AppText style={styles.entryBody}>{entry.body}</AppText>
      <AppText variant="caption" color={colors.inkMuted} style={styles.entryMeta}>{meta}</AppText>
      {entry.tags.length > 0 ? (
        <View style={styles.tags}>
          {entry.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <AppText variant="caption" style={styles.tagText}>{tag}</AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  hero: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingBottom: 22, overflow: 'hidden' },
  privateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  composer: {
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  promptLabel: { textTransform: 'none', letterSpacing: 0.3, fontSize: 12, marginBottom: 8 },
  composerGhost: { fontSize: 14, lineHeight: 22 },
  composerFoot: { flexDirection: 'row', gap: 8, marginTop: 12 },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(193,123,92,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  body: { padding: 20, paddingBottom: 40 },
  pastLabel: { marginBottom: 12 },
  entry: {
    backgroundColor: colors.warm,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(193,123,92,0.25)',
    borderRadius: radius.sm,
    padding: 16,
    marginBottom: 10,
  },
  entryDate: { marginBottom: 8 },
  entryBody: { fontFamily: fonts.serifItalic, fontSize: 15, lineHeight: 26, color: colors.inkLight },
  entryMeta: { marginTop: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { backgroundColor: colors.cream, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  tagText: { fontSize: 9 },
});
