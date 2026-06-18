/**
 * Calendar + Firsts/Milestones tracker screen.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { useAuth } from '../../src/hooks/useAuth';
import { useBabyContext } from '../../src/contexts/BabyContext';
import { useToast } from '../../src/hooks/useToast';
import {
  getMilestonesForBaby,
  captureMilestone,
  createMilestoneFromTemplate,
} from '../../src/services/firestore';
import { MILESTONE_TEMPLATES } from '../../src/constants/stickers';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import type { Milestone } from '../../src/types';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month));
  const end = addDays(start, 34); // 5 rows
  const days: Date[] = [];
  let d = start;
  while (d <= end) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

export default function FirstsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeBaby, ageInfo } = useBabyContext();
  const { showToast, ToastView } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (!user?.uid || !activeBaby) return;
    getMilestonesForBaby(user.uid, activeBaby.id).then(setMilestones);
  }, [user?.uid, activeBaby?.id]);

  const calDays = buildCalendarDays(currentMonth);

  const getDots = (day: Date) => {
    const captured = milestones.filter(
      (m) => m.isCaptured && m.capturedAt && isSameDay(m.capturedAt, day)
    );
    return captured.map((m) => ({ type: 'milestone' as const }));
  };

  const handleCaptureMilestone = async (templateId: string) => {
    if (!user?.uid || !activeBaby) return;
    const existing = milestones.find((m) => m.type === templateId);
    if (existing?.isCaptured) {
      showToast('Already captured! 🎉', 'This milestone has already been marked.');
      return;
    }
    try {
      let milestoneId = existing?.id;
      if (!milestoneId) {
        const template = MILESTONE_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return;
        milestoneId = await createMilestoneFromTemplate(user.uid, activeBaby.id, {
          ...template,
          description: template.title,
        });
      }
      await captureMilestone(user.uid, milestoneId);
      router.push({ pathname: '/milestone/[id]', params: { id: milestoneId } });
      // Refresh
      const updated = await getMilestonesForBaby(user.uid, activeBaby.id);
      setMilestones(updated);
    } catch (err) {
      showToast('Something went wrong', (err as Error).message, 'error');
    }
  };

  const upcomingMilestones = MILESTONE_TEMPLATES.filter(
    (t) => !milestones.find((m) => m.type === t.id && m.isCaptured)
  ).slice(0, 3);

  return (
  <View style={{ flex: 1 }}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <LinearGradient
          colors={['rgba(181,196,177,0.15)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
        <Text style={styles.month}>
          <Text style={styles.monthItalic}>{format(currentMonth, 'MMMM')}</Text>{' '}
          {format(currentMonth, 'yyyy')}
        </Text>
        <Text style={styles.subHeader}>
          {activeBaby?.name ?? 'Your child'} is{' '}
          {ageInfo?.displayAge ?? '...'} this month
        </Text>
      </View>

      {/* Month nav */}
      <View style={styles.calNav}>
        <TouchableOpacity
          style={styles.navArrow}
          onPress={() => setCurrentMonth((m) => subMonths(m, 1))}
        >
          <Text style={styles.navArrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navLabel}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity
          style={styles.navArrow}
          onPress={() => setCurrentMonth((m) => addMonths(m, 1))}
        >
          <Text style={styles.navArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.daysHeader}>
        {DAYS.map((d) => (
          <View key={d} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calGrid}>
        {calDays.map((day, i) => {
          const dots = getDots(day);
          const isOther = !isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          return (
            <View
              key={i}
              style={[
                styles.calDay,
                isOther && styles.calDayOther,
                isToday && styles.calDayToday,
              ]}
            >
              <Text
                style={[
                  styles.calDayNum,
                  isOther && styles.calDayNumOther,
                  isToday && styles.calDayNumToday,
                ]}
              >
                {format(day, 'd')}
              </Text>
              <View style={styles.dots}>
                {dots.map((dot, di) => (
                  <View
                    key={di}
                    style={[
                      styles.dot,
                      dot.type === 'milestone' && { backgroundColor: Colors.sienna },
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { color: Colors.sienna, label: 'Milestone' },
          { color: Colors.sageDark, label: 'Memory' },
          { color: Colors.gold, label: 'Appointment' },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming milestones */}
      <View style={styles.upcoming}>
        <EyebrowLabel>Coming up</EyebrowLabel>
        {upcomingMilestones.map((template, i) => (
          <TouchableOpacity
            key={template.id}
            style={styles.upcomingEvent}
            onPress={() => handleCaptureMilestone(template.id)}
            activeOpacity={0.8}
          >
            <View style={styles.upcomingDate}>
              <Text style={styles.upcomingDateNum}>
                {template.expectedAgeLabel.split(' ')[0]}
              </Text>
              <Text style={styles.upcomingDateMon}>
                {template.expectedAgeLabel.split(' ').slice(1).join(' ')}
              </Text>
            </View>
            <View style={styles.upcomingDotCol}>
              <View style={[styles.upcomingDot, { backgroundColor: Colors.sienna }]} />
              {i < upcomingMilestones.length - 1 && (
                <View style={styles.upcomingLine} />
              )}
            </View>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingTitle}>{template.title}</Text>
              <Text style={styles.upcomingMeta}>
                Milestone · Tap to capture {template.emoji}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* All milestones */}
      <View style={styles.allMilestones}>
        <EyebrowLabel>All firsts</EyebrowLabel>
        {MILESTONE_TEMPLATES.map((template) => {
          const done = milestones.find(
            (m) => m.type === template.id && m.isCaptured
          );
          return (
            <TouchableOpacity
              key={template.id}
              style={styles.milestoneItem}
              onPress={() => handleCaptureMilestone(template.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.milestoneEmoji}>{template.emoji}</Text>
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneTitle}>{template.title}</Text>
                <Text style={styles.milestoneAge}>{template.expectedAgeLabel}</Text>
              </View>
              <View
                style={[
                  styles.milestoneStatus,
                  done && styles.milestoneStatusDone,
                ]}
              >
                <Text style={styles.milestoneStatusText}>
                  {done ? '✓' : '○'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
    {ToastView}
  </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    overflow: 'hidden',
  },
  month: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 32,
    color: Colors.cream,
    marginBottom: 2,
  },
  monthItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.sage,
  },
  subHeader: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: 'rgba(251,247,242,0.4)',
  },

  calNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: 14,
    backgroundColor: Colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,169,160,0.2)',
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: { fontSize: 18, color: Colors.ink },
  navLabel: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 20,
    color: Colors.ink,
  },

  daysHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,169,160,0.2)',
  },
  dayHeader: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  dayHeaderText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.inkMedium,
  },

  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(196,169,160,0.15)',
    gap: 1,
  },
  calDay: {
    width: `${100 / 7}%`,
    minHeight: 52,
    backgroundColor: Colors.warm,
    padding: 6,
  },
  calDayOther: { backgroundColor: 'rgba(254,252,249,0.5)' },
  calDayToday: { backgroundColor: 'rgba(193,123,92,0.08)' },
  calDayNum: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.ink,
    lineHeight: 16,
  },
  calDayNumOther: { color: 'rgba(44,36,32,0.25)' },
  calDayNumToday: { color: Colors.sienna, fontFamily: 'DMSans_500Medium' },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },

  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    backgroundColor: Colors.warm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,169,160,0.2)',
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: Colors.inkMedium,
  },

  // Upcoming
  upcoming: { paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'] },
  upcomingEvent: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,169,160,0.15)',
  },
  upcomingDate: {
    width: 40,
    alignItems: 'center',
    paddingTop: 2,
  },
  upcomingDateNum: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 20,
    color: Colors.ink,
    lineHeight: 22,
  },
  upcomingDateMon: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    color: Colors.inkMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  upcomingDotCol: {
    alignItems: 'center',
    paddingTop: 4,
    gap: 4,
  },
  upcomingDot: { width: 10, height: 10, borderRadius: 5 },
  upcomingLine: { width: 1, height: 20, backgroundColor: 'rgba(196,169,160,0.3)' },
  upcomingInfo: { flex: 1 },
  upcomingTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.sizes.md,
    color: Colors.ink,
    marginBottom: 2,
  },
  upcomingMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.inkMedium,
  },

  // All milestones list
  allMilestones: { paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'] },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,169,160,0.12)',
  },
  milestoneEmoji: { fontSize: 24 },
  milestoneInfo: { flex: 1 },
  milestoneTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.ink,
  },
  milestoneAge: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
    marginTop: 2,
  },
  milestoneStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneStatusDone: {
    backgroundColor: 'rgba(122,158,126,0.15)',
    borderColor: Colors.sageDark,
  },
  milestoneStatusText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: Colors.sageDark,
  },
});
