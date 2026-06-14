import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, EmptyState } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useJournal } from '@/hooks/useBabyData';
import { formatTime, tsToDate } from '@/lib/format';
import { formatLongDate } from '@/lib/age';
import { colors, fonts, radius } from '@/theme';
import type { JournalEntry } from '@/types/models';

export default function Journal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby } = useAuth();
  const { items: entries, loading } = useJournal(activeBaby?.id);

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <AppText variant="title">
          {activeBaby?.name ?? 'Baby'}&apos;s{' '}
          <AppText variant="titleItalic" color={colors.sienna}>
            Journal
          </AppText>
        </AppText>
        <AppText variant="caption">The things photos can&apos;t capture</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {entries.length === 0 && !loading ? (
          <EmptyState
            emoji="✍️"
            title="Nothing written yet"
            subtitle="Write down the feeling, the smell, the 3am thought you know you'll forget."
          />
        ) : (
          entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)
        )}

        <Pressable style={styles.addCard} onPress={() => router.push('/journal-entry')}>
          <AppText style={styles.addIcon}>✍️</AppText>
          <AppText variant="titleItalic" color={colors.inkMuted}>
            What are you feeling right now?
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  const date = tsToDate(entry.createdAt);
  return (
    <View style={styles.entry}>
      <View style={styles.tape} />
      {entry.mood ? <AppText style={styles.mood}>{entry.mood}</AppText> : null}
      <AppText variant="label" style={styles.date}>
        {date ? `${formatLongDate(date)} · ${formatTime(date)}` : ''}
      </AppText>
      <AppText style={styles.body}>{entry.body}</AppText>
      {entry.tags.length > 0 ? (
        <View style={styles.tags}>
          {entry.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <AppText variant="caption" style={styles.tagText}>
                {tag}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { marginBottom: 8 },
  scroll: { padding: 20, paddingBottom: 40 },
  entry: {
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 20,
    marginTop: 14,
    position: 'relative',
  },
  tape: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -22,
    width: 44,
    height: 14,
    backgroundColor: 'rgba(201,169,110,0.3)',
    borderRadius: 1,
  },
  mood: { position: 'absolute', top: 16, right: 16, fontSize: 22 },
  date: { marginBottom: 10 },
  body: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    lineHeight: 26,
    color: colors.inkLight,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  tag: {
    backgroundColor: colors.cream,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  tagText: { fontSize: 9 },
  addCard: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.35)',
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  addIcon: { fontSize: 24 },
});
