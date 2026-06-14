/**
 * Memory Journal — displays journal entries styled like a physical scrapbook.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useAuth } from '../../src/hooks/useAuth';
import { useBaby } from '../../src/hooks/useBaby';
import { getJournalEntriesForBaby } from '../../src/services/firestore';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import type { JournalEntry } from '../../src/types';

const PHOTO_GRADIENTS = [
  ['#E8C4B0', '#C4907A'],
  ['#C5D4C0', '#A8BFA8'],
  ['#E8D5B0', '#D4B880'],
  ['#D4C4D8', '#B4A0C0'],
] as const;

const PHOTO_EMOJIS = ['🌙', '☀️', '🌿', '💛', '⭐', '🍼'];

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeBaby } = useBaby(user?.uid ?? null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid || !activeBaby) return;
    setLoading(true);
    getJournalEntriesForBaby(user.uid, activeBaby.id)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [user?.uid, activeBaby]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>
          {activeBaby?.name ?? 'Your little one'}'s{' '}
          <Text style={styles.titleItalic}>Journal</Text>
        </Text>
        <Text style={styles.sub}>The things photos can't capture</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          color={Colors.sienna}
          style={{ marginTop: 40 }}
          size="large"
        />
      ) : entries.length > 0 ? (
        <View style={styles.entries}>
          {entries.map((entry, i) => (
            <View key={entry.id} style={styles.entry}>
              {/* Tape */}
              <View style={styles.tape} />

              {/* Mood */}
              {entry.mood && (
                <Text style={styles.mood}>{entry.mood}</Text>
              )}

              <Text style={styles.entryDate}>
                {format(entry.capturedAt, "EEEE, d MMMM · h:mmaaa")}
              </Text>

              {/* Photo placeholder */}
              <LinearGradient
                colors={
                  (PHOTO_GRADIENTS[i % PHOTO_GRADIENTS.length] as unknown) as [
                    string,
                    string
                  ]
                }
                style={styles.entryPhoto}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={{ fontSize: 36 }}>
                  {PHOTO_EMOJIS[i % PHOTO_EMOJIS.length]}
                </Text>
              </LinearGradient>

              {/* Entry text */}
              <Text style={styles.entryText}>"{entry.text}"</Text>

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <View style={styles.tags}>
                  {entry.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.emptySub}>
            Start writing down the little moments you never want to forget.
          </Text>
        </View>
      )}

      {/* Add entry CTA */}
      <TouchableOpacity
        style={styles.addCard}
        onPress={() => router.push('/journal/new')}
        activeOpacity={0.8}
      >
        <Text style={styles.addIcon}>✍️</Text>
        <Text style={styles.addText}>What are you feeling right now?</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },

  header: {
    backgroundColor: Colors.warm,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,169,160,0.2)',
  },
  title: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 30,
    color: Colors.ink,
    marginBottom: 4,
  },
  titleItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.sienna,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
  },

  entries: {
    padding: Spacing.xl,
    gap: 12,
  },
  entry: {
    backgroundColor: Colors.warm,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.2)',
    padding: Spacing.xl,
    position: 'relative',
    marginTop: 8,
  },
  tape: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    width: 44,
    height: 14,
    backgroundColor: 'rgba(201,169,110,0.3)',
    borderRadius: 1,
    zIndex: 1,
  },
  mood: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 20,
  },
  entryDate: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.sienna,
    marginBottom: 10,
  },
  entryPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  entryText: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: Typography.sizes.md,
    color: Colors.inkLight,
    lineHeight: 26,
    marginBottom: 14,
  },
  tags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: Colors.cream,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  tagText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    color: Colors.inkMedium,
    letterSpacing: 0.5,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: { fontSize: 40, opacity: 0.4 },
  emptyTitle: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 24,
    color: Colors.inkMedium,
  },
  emptySub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.inkMedium,
    textAlign: 'center',
    lineHeight: 20,
  },

  addCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.35)',
    borderStyle: 'dashed',
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  addIcon: { fontSize: 24 },
  addText: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: 16,
    color: Colors.inkMedium,
  },
});
