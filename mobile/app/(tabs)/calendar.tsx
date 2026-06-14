import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  Button,
  DateField,
  Eyebrow,
  GlowHeader,
  Text,
  TextField,
} from "../../src/components/ui";
import { colors, radius } from "../../src/theme/tokens";
import { fonts } from "../../src/theme/typography";
import { useAuth } from "../../src/context/AuthContext";
import { useChild } from "../../src/context/ChildContext";
import { useEvents } from "../../src/hooks/useChildData";
import { createEvent, deleteEvent } from "../../src/services/events";
import { computeAge, toDateKey } from "../../src/lib/date";
import { useSafeArea } from "../../src/hooks/useSafeArea";
import { haptics } from "../../src/lib/haptics";
import type { CalendarEvent, CalendarEventType } from "../../src/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TYPE_COLOR: Record<CalendarEventType, string> = {
  milestone: colors.sienna,
  memory: colors.sageDark,
  appointment: colors.gold,
};

export default function Calendar() {
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { top } = useSafeArea();
  const { data: events } = useEvents(activeChild?.id);

  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState<Date>(today);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => buildMonth(cursor), [cursor]);

  const upcoming = useMemo(() => {
    const todayKey = toDateKey(today);
    return events
      .filter((e) => e.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

  const monthAge = computeAge(
    activeChild?.bornAt,
    new Date(cursor.getFullYear(), cursor.getMonth(), 15),
  );

  function shift(delta: number) {
    haptics.tap();
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlowHeader
          style={[styles.header, { paddingTop: top + 20 }]}
          glow="rgba(181,196,177,0.16)"
          glowCorner="bottom-left"
        >
          <Text variant="title" color={colors.cream} style={styles.month}>
            <Text variant="title" italic color={colors.sage}>
              {MONTHS[cursor.getMonth()]}
            </Text>{" "}
            {cursor.getFullYear()}
          </Text>
          <Text variant="caption" color={colors.creamOn40}>
            {monthAge
              ? `${activeChild?.name.split(" ")[0]} is ${monthAge.label} this month`
              : "Your memory calendar"}
          </Text>
        </GlowHeader>

        <View style={styles.nav}>
          <Pressable style={styles.navArrow} onPress={() => shift(-1)}>
            <Ionicons name="chevron-back" size={18} color={colors.ink} />
          </Pressable>
          <Text variant="serif" style={styles.navLabel}>
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </Text>
          <Pressable style={styles.navArrow} onPress={() => shift(1)}>
            <Ionicons name="chevron-forward" size={18} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.dowRow}>
          {DOW.map((d) => (
            <Text key={d} style={styles.dow}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell, idx) => {
            const key = toDateKey(cell.date);
            const dayEvents = byDate.get(key) ?? [];
            const isToday = key === toDateKey(today);
            return (
              <Pressable
                key={idx}
                style={[
                  styles.cell,
                  !cell.inMonth && styles.cellOther,
                  isToday && styles.cellToday,
                ]}
                onPress={() => {
                  haptics.tap();
                  setAddDate(cell.date);
                  setAddOpen(true);
                }}
              >
                <Text
                  style={[
                    styles.cellNum,
                    !cell.inMonth && styles.cellNumOther,
                    isToday && styles.cellNumToday,
                  ]}
                >
                  {cell.date.getDate()}
                </Text>
                <View style={styles.dots}>
                  {dayEvents.slice(0, 3).map((e) => (
                    <View
                      key={e.id}
                      style={[styles.dot, { backgroundColor: TYPE_COLOR[e.type] }]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.legend}>
          <LegendItem color={colors.sienna} label="Milestone" />
          <LegendItem color={colors.sageDark} label="Memory" />
          <LegendItem color={colors.gold} label="Appointment" />
        </View>

        <View style={styles.upcoming}>
          <Eyebrow>Coming up</Eyebrow>
          {upcoming.length === 0 ? (
            <Text variant="bodyMuted" style={styles.emptyUpcoming}>
              Tap any day to add a milestone, memory or appointment.
            </Text>
          ) : (
            <View style={styles.eventList}>
              {upcoming.map((e) => (
                <UpcomingEvent
                  key={e.id}
                  event={e}
                  onDelete={() =>
                    activeChild && deleteEvent(activeChild.id, e.id)
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <AddEventModal
        visible={addOpen}
        initialDate={addDate}
        onClose={() => setAddOpen(false)}
        onSave={async (type, title, meta, date) => {
          if (!user || !activeChild) return;
          await createEvent(user.uid, activeChild.id, {
            type,
            title,
            meta,
            date: toDateKey(date),
          });
          haptics.success();
        }}
      />
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text variant="caption" color={colors.inkMuted}>
        {label}
      </Text>
    </View>
  );
}

function UpcomingEvent({
  event,
  onDelete,
}: {
  event: CalendarEvent;
  onDelete: () => void;
}) {
  const [, m, d] = event.date.split("-");
  const monthShort = MONTHS[Number(m) - 1]?.slice(0, 3) ?? "";
  return (
    <View style={styles.event}>
      <View style={styles.eventDate}>
        <Text style={styles.eventDateNum}>{Number(d)}</Text>
        <Text style={styles.eventDateMon}>{monthShort}</Text>
      </View>
      <View style={[styles.eventBar, { backgroundColor: TYPE_COLOR[event.type] }]} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        {event.meta ? <Text style={styles.eventMeta}>{event.meta}</Text> : null}
      </View>
      <Pressable onPress={onDelete} hitSlop={8} style={styles.eventDelete}>
        <Ionicons name="close" size={16} color={colors.inkMuted} />
      </Pressable>
    </View>
  );
}

function AddEventModal({
  visible,
  initialDate,
  onClose,
  onSave,
}: {
  visible: boolean;
  initialDate: Date;
  onClose: () => void;
  onSave: (
    type: CalendarEventType,
    title: string,
    meta: string,
    date: Date,
  ) => Promise<void>;
}) {
  const [type, setType] = useState<CalendarEventType>("memory");
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState("");
  const [date, setDate] = useState<Date>(initialDate);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setDate(initialDate);
      setTitle("");
      setMeta("");
      setType("memory");
      setError(null);
    }
  }, [visible, initialDate]);

  async function save() {
    if (!title.trim()) {
      setError("Give the event a title.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave(type, title, meta, date);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  const TYPES: { key: CalendarEventType; label: string }[] = [
    { key: "milestone", label: "Milestone" },
    { key: "memory", label: "Memory" },
    { key: "appointment", label: "Appointment" },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modal}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={26} color={colors.ink} />
            </Pressable>
            <Eyebrow>New event</Eyebrow>
            <View style={{ width: 26 }} />
          </View>

          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => {
                  haptics.tap();
                  setType(t.key);
                }}
                style={[
                  styles.typeChip,
                  type === t.key && {
                    backgroundColor: TYPE_COLOR[t.key],
                    borderColor: TYPE_COLOR[t.key],
                  },
                ]}
              >
                <Text
                  variant="caption"
                  color={type === t.key ? colors.white : colors.inkMuted}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.fields}>
            <TextField placeholder="Title" value={title} onChangeText={setTitle} maxLength={120} />
            <TextField placeholder="Details (optional)" value={meta} onChangeText={setMeta} maxLength={200} />
            <DateField leadingEmoji="📅" value={date} onChange={setDate} />
          </View>

          {error ? (
            <Text variant="caption" color={colors.sienna} style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button label="Add to calendar →" onPress={save} loading={busy} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface Cell {
  date: Date;
  inMonth: boolean;
}
function buildMonth(cursor: Date): Cell[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const cells: Cell[] = [];
  const start = new Date(year, month, 1 - startOffset);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  // Trim trailing all-other week if unused.
  return cells.slice(0, cells[35].inMonth || cells.slice(35).some((c) => c.inMonth) ? 42 : 35);
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 32 },
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  month: { fontSize: 32, marginBottom: 2 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: { fontSize: 20 },
  dowRow: {
    flexDirection: "row",
    backgroundColor: colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  dow: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 10,
    fontFamily: fonts.sans,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.inkMuted,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", backgroundColor: colors.hairline, gap: 1 },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 54,
    backgroundColor: colors.warm,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cellOther: { backgroundColor: "rgba(254,252,249,0.5)" },
  cellToday: { backgroundColor: "rgba(193,123,92,0.08)" },
  cellNum: { fontFamily: fonts.sans, fontSize: 12, color: colors.ink },
  cellNumOther: { color: "rgba(44,36,32,0.25)" },
  cellNumToday: { color: colors.sienna, fontFamily: fonts.sansMedium },
  dots: { flexDirection: "row", gap: 2, flexWrap: "wrap", marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 999 },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.warm,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 999 },
  upcoming: { paddingHorizontal: 20, paddingTop: 24 },
  emptyUpcoming: { marginTop: 14 },
  eventList: { marginTop: 14 },
  event: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(196,169,160,0.15)",
  },
  eventDate: { alignItems: "center", width: 36 },
  eventDateNum: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
  eventDateMon: {
    fontFamily: fonts.sans,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.inkMuted,
  },
  eventBar: { width: 3, height: 32, borderRadius: 2 },
  eventInfo: { flex: 1 },
  eventTitle: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  eventMeta: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  eventDelete: { padding: 4 },

  modal: { flex: 1, backgroundColor: colors.cream },
  modalScroll: { padding: 24, paddingBottom: 40 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
  },
  fields: { gap: 14 },
  error: { marginTop: 14 },
  saveBtn: { marginTop: 24 },
});
