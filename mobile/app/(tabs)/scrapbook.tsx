import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, EmptyState, Icon } from '@/components';
import { MemoryThumb } from '@/components/MemoryThumb';
import { useAuth } from '@/context/AuthContext';
import { useJournal, useMemories } from '@/hooks/useBabyData';
import { ERAS, eraForAgeYears } from '@/data/stickers';
import { computeAge, daysOldLabel, formatLongDate } from '@/lib/age';
import { formatRelative, formatTime, tsToDate } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';

export default function Scrapbook() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, isOwner } = useAuth();
  const { items: memories, loading } = useMemories(activeBaby?.id);
  const { items: journal } = useJournal(isOwner ? activeBaby?.id : undefined);
  const [printView, setPrintView] = useState(false);

  const age = computeAge(activeBaby?.birthDate);
  const ageYears = age?.years ?? 0;
  const ageMonths = age?.months ?? 0;
  const era = eraForAgeYears(ageYears);
  const nextEra = ERAS[ERAS.indexOf(era) + 1];
  const monthsToNext = nextEra ? Math.max(0, nextEra.minAgeYears * 12 - ageMonths) : 0;

  const featured = memories[0];
  const rest = memories.slice(1);
  const latestNote = journal[0];
  const name = activeBaby?.name ?? 'Baby';

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
        <LinearGradient colors={['rgba(181,196,177,0.16)', 'transparent']} start={{ x: 0.8, y: 1 }} end={{ x: 0.2, y: 0 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={styles.heroRow}>
          <View style={styles.flex1}>
            <AppText variant="display" color={colors.cream}>
              {name}&apos;s <AppText variant="displayItalic" color={colors.rose}>scrapbook</AppText>
            </AppText>
          </View>
          <Pressable style={[styles.printToggle, printView && styles.printToggleOn]} onPress={() => setPrintView((v) => !v)}>
            <Icon name="book-outline" size={13} color={printView ? colors.ink : colors.gold} />
            <AppText variant="label" color={printView ? colors.ink : colors.gold} style={styles.printLabel}>
              {printView ? 'Book view' : 'Print view'}
            </AppText>
          </Pressable>
        </View>
        <View style={styles.eraRow}>
          <View style={styles.eraBadge}>
            <Icon name="leaf-outline" size={11} color={colors.rose} />
            <AppText variant="caption" color={colors.rose}>{era.label.replace(/^\S+\s/, '')}</AppText>
          </View>
          {nextEra ? (
            <AppText variant="caption" color={colors.onDark40} style={styles.eraNext}>
              {nextEra.id === 'little' ? 'Little One' : nextEra.id === 'growing' ? 'Growing Up' : 'Teen'} era in {monthsToNext} mo →
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={[styles.page, printView && styles.pagePrint]}>
        {memories.length === 0 && !loading ? (
          <EmptyState
            icon="book-outline"
            title="The first page is waiting"
            subtitle={
              isOwner
                ? 'Capture a photo, video or journal entry and it will appear here — kept private and safe.'
                : 'Photos and firsts shared with you will appear here. The journal stays with the parent.'
            }
          />
        ) : (
          <>
            {featured ? (
              <View style={[styles.featured, printView && styles.featuredPrint]}>
                <MemoryThumb storagePath={featured.storagePath} kind={featured.kind} index={0} height={200} />
                <View style={styles.featuredMeta}>
                  {featured.caption ? (
                    <AppText variant="titleItalic" color={colors.ink} style={styles.featuredCaption}>“{featured.caption}”</AppText>
                  ) : (
                    <AppText variant="titleItalic" color={colors.ink} style={styles.featuredCaption}>{featured.title}</AppText>
                  )}
                  <AppText variant="caption" style={styles.featuredDate}>
                    {captionDate(featured.createdAt, activeBaby?.birthDate, name)}
                  </AppText>
                </View>
              </View>
            ) : null}

            {printView ? (
              <View style={styles.printBadge}>
                <Icon name="print-outline" size={13} color={colors.gold} />
                <AppText variant="caption" color={colors.gold} style={styles.printBadgeText}>
                  This page is print-ready — this is how your hardcover book will look.
                </AppText>
              </View>
            ) : null}

            {isOwner && latestNote ? (
              <View style={styles.journalBox}>
                <AppText variant="label" color={colors.sienna} style={styles.journalPrompt}>Only you will ever read this —</AppText>
                <AppText variant="serifItalic" color={colors.inkLight} style={styles.journalText} numberOfLines={3}>
                  “{latestNote.body}”
                </AppText>
                <AppText variant="caption" style={styles.journalPrivate}>Journal · private forever</AppText>
              </View>
            ) : null}

            {rest.length > 0 ? (
              <View style={styles.grid}>
                {rest.map((mem, i) => (
                  <View key={mem.id} style={styles.card}>
                    <MemoryThumb storagePath={mem.storagePath} kind={mem.kind} index={i + 1} height={120} />
                    <View style={styles.cardMeta}>
                      <AppText variant="bodyMedium" numberOfLines={1}>{mem.title}</AppText>
                      <AppText variant="caption">{formatRelative(tsToDate(mem.createdAt))}</AppText>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function captionDate(
  createdAt: Parameters<typeof tsToDate>[0],
  birthISO: string | null | undefined,
  name: string,
): string {
  const d = tsToDate(createdAt);
  if (!d) return '';
  const days = daysOldLabel(birthISO, d);
  return `${formatLongDate(d)} · ${formatTime(d)}${days ? ` · ${name} is ${days}` : ''}`;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  hero: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingBottom: 20, overflow: 'hidden' },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  printToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6,
    backgroundColor: 'rgba(201,169,110,0.15)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm,
  },
  printToggleOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  printLabel: { letterSpacing: 0.8 },
  eraRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  eraBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  eraNext: { fontStyle: 'italic' },
  page: { padding: 20, paddingBottom: 40 },
  pagePrint: { backgroundColor: '#F3EBDD', margin: 12, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(201,169,110,0.25)' },
  featured: { backgroundColor: colors.warm, borderRadius: radius.md, overflow: 'hidden', marginBottom: 14 },
  featuredPrint: { borderWidth: 1, borderColor: 'rgba(201,169,110,0.3)' },
  featuredMeta: { padding: 14 },
  featuredCaption: { fontSize: 18, lineHeight: 26 },
  featuredDate: { marginTop: 6 },
  printBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(201,169,110,0.1)', borderWidth: 1, borderColor: 'rgba(201,169,110,0.2)',
    borderRadius: radius.sm, padding: 10, marginBottom: 14,
  },
  printBadgeText: { flex: 1, lineHeight: 16 },
  journalBox: {
    backgroundColor: 'rgba(44,36,32,0.03)', borderLeftWidth: 2, borderLeftColor: 'rgba(193,123,92,0.25)',
    padding: 14, borderRadius: radius.sm, marginBottom: 14,
  },
  journalPrompt: { marginBottom: 6 },
  journalText: { fontSize: 14, lineHeight: 22 },
  journalPrivate: { marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { width: '48.5%', backgroundColor: colors.warm, borderRadius: radius.md, overflow: 'hidden' },
  cardMeta: { paddingHorizontal: 12, paddingVertical: 10 },
});
