import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Hero } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useEvents, useMemories, useMilestones } from '@/hooks/useBabyData';
import { computeAge, monthName, monthShort, toISODate } from '@/lib/age';
import { tsToDate } from '@/lib/format';
import { colors, fonts, radius } from '@/theme';
import type { EventType } from '@/types/models';

type DotType = 'milestone' | 'memory' | 'appointment';
const DOT_COLORS: Record<DotType, string> = {
  milestone: colors.dotMilestone,
  memory: colors.dotMemory,
  appointment: colors.dotAppointment,
};

export default function Calendar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby } = useAuth();
  const today = new Date();

  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const { items: events } = useEvents(activeBaby?.id);
  const { items: memories } = useMemories(activeBaby?.id);
  const { items: milestones } = useMilestones(activeBaby?.id);

  // Map of ISO date -> set of dot types.
  const dots = useMemo(() => {
    const map = new Map<string, Set<DotType>>();
    const add = (iso: string, type: DotType) => {
      if (!map.has(iso)) map.set(iso, new Set());
      map.get(iso)!.add(type);
    };
    events.forEach((e) => add(e.date, e.type as DotType));
    memories.forEach((m) => {
      const d = tsToDate(m.createdAt);
      if (d) add(toISODate(d), 'memory');
    });
    milestones.forEach((m) => {
      const d = tsToDate(m.capturedAt);
      if (d) add(toISODate(d), 'milestone');
    });
    return map;
  }, [events, memories, milestones]);

  const grid = useMemo(() => buildGrid(cursor.year, cursor.month), [cursor]);

  const upcoming = useMemo(() => {
    const todayIso = toISODate(today);
    return [...events]
      .filter((e) => e.date >= todayIso)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

  const age = computeAge(activeBaby?.birthDate);

  const shift = (delta: number) => {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <Hero paddingTop={insets.top + 16} glow="rgba(181,196,177,0.15)">
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.cream} />
        </Pressable>
        <AppText variant="display" color={colors.cream}>
          <AppText variant="displayItalic" color={colors.sage}>
            {monthName(cursor.month)}
          </AppText>{' '}
          {cursor.year}
        </AppText>
        {age ? (
          <AppText variant="caption" color={colors.onDark40}>
            {activeBaby?.name} is {age.label}
          </AppText>
        ) : null}
      </Hero>

      <View style={styles.nav}>
        <Pressable style={styles.navArrow} onPress={() => shift(-1)}>
          <Ionicons name="chevron-back" size={16} color={colors.ink} />
        </Pressable>
        <AppText variant="titleItalic">
          {monthName(cursor.month)} {cursor.year}
        </AppText>
        <Pressable style={styles.navArrow} onPress={() => shift(1)}>
          <Ionicons name="chevron-forward" size={16} color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.daysHeader}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <AppText key={d} variant="caption" style={styles.dayHeaderCell}>
            {d}
          </AppText>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((cell) => {
          const iso = toISODate(cell.date);
          const isToday = iso === toISODate(today);
          const cellDots = dots.get(iso);
          return (
            <View
              key={iso}
              style={[styles.cell, !cell.inMonth && styles.cellOther, isToday && styles.cellToday]}
            >
              <AppText
                variant="caption"
                style={[
                  styles.cellNum,
                  !cell.inMonth && styles.cellNumOther,
                  isToday && styles.cellNumToday,
                ]}
              >
                {cell.date.getDate()}
              </AppText>
              {cellDots ? (
                <View style={styles.dotRow}>
                  {Array.from(cellDots).map((t) => (
                    <View key={t} style={[styles.dot, { backgroundColor: DOT_COLORS[t] }]} />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        {(['milestone', 'memory', 'appointment'] as DotType[]).map((t) => (
          <View key={t} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: DOT_COLORS[t] }]} />
            <AppText variant="caption">{t[0].toUpperCase() + t.slice(1)}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.upcoming}>
        <AppText variant="label" style={styles.upcomingLabel}>
          Coming up
        </AppText>
        {upcoming.length === 0 ? (
          <AppText variant="caption">No upcoming events yet.</AppText>
        ) : (
          upcoming.map((e) => {
            const [y, m, d] = e.date.split('-').map(Number);
            return (
              <View key={e.id} style={styles.event}>
                <View style={styles.eventDate}>
                  <AppText variant="titleItalic" style={styles.eventNum}>
                    {d}
                  </AppText>
                  <AppText variant="caption" style={styles.eventMon}>
                    {monthShort(m - 1)}
                  </AppText>
                </View>
                <View style={[styles.eventDotWrap]}>
                  <View style={[styles.dotLarge, { backgroundColor: DOT_COLORS[e.type as DotType] }]} />
                </View>
                <View style={styles.flex1}>
                  <AppText variant="bodyMedium">{e.title}</AppText>
                  {e.meta ? <AppText variant="caption">{e.meta}</AppText> : null}
                </View>
              </View>
            );
          })
        )}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

interface Cell {
  date: Date;
  inMonth: boolean;
}

function buildGrid(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const cells: Cell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date, inMonth: date.getMonth() === month });
  }
  return cells;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  back: { marginBottom: 8 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysHeader: {
    flexDirection: 'row',
    backgroundColor: colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  dayHeaderCell: { flex: 1, textAlign: 'center', fontSize: 9, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'rgba(196,169,160,0.15)', gap: 1 },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 52,
    backgroundColor: colors.warm,
    paddingTop: 6,
    paddingHorizontal: 4,
    marginLeft: -0.4,
  },
  cellOther: { backgroundColor: 'rgba(254,252,249,0.5)' },
  cellToday: { backgroundColor: 'rgba(193,123,92,0.08)' },
  cellNum: { fontSize: 12, color: colors.ink },
  cellNumOther: { color: 'rgba(44,36,32,0.25)' },
  cellNumToday: { color: colors.sienna, fontFamily: fonts.bodyMedium },
  dotRow: { flexDirection: 'row', gap: 2, marginTop: 3, flexWrap: 'wrap' },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  legend: {
    flexDirection: 'row',
    gap: 16,
    padding: 14,
    backgroundColor: colors.warm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  upcoming: { paddingHorizontal: 20, paddingTop: 20 },
  upcomingLabel: { marginBottom: 14 },
  event: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,169,160,0.15)',
  },
  eventDate: { alignItems: 'center', width: 36 },
  eventNum: { fontSize: 20, lineHeight: 22 },
  eventMon: { fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase' },
  eventDotWrap: { alignItems: 'center' },
  dotLarge: { width: 10, height: 10, borderRadius: 5 },
});
