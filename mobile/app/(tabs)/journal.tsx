import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Button, Eyebrow, Loading, Text } from "../../src/components/ui";
import { AssetImage } from "../../src/components/AssetImage";
import { TagInput } from "../../src/components/TagInput";
import { colors, radius } from "../../src/theme/tokens";
import { fonts } from "../../src/theme/typography";
import { useAuth } from "../../src/context/AuthContext";
import { useChild } from "../../src/context/ChildContext";
import { useJournal } from "../../src/hooks/useChildData";
import {
  createJournalEntry,
  deleteJournalEntry,
} from "../../src/services/journal";
import { formatLongDateTime } from "../../src/lib/date";
import { useSafeArea } from "../../src/hooks/useSafeArea";
import { haptics } from "../../src/lib/haptics";
import { LIMITS } from "../../src/lib/validation";
import type { JournalEntry } from "../../src/types";

const MOODS = ["🥰", "😴", "😭", "😊", "😮‍💨", "🤱", "🎉", "🌙"];
const ENTRY_GRADIENTS: [string, string][] = [
  ["#E8C4B0", "#C4907A"],
  ["#C5D4C0", "#A8BFA8"],
];

export default function Journal() {
  const params = useLocalSearchParams<{ compose?: string }>();
  const { user } = useAuth();
  const { activeChild } = useChild();
  const { top } = useSafeArea();
  const { data, loading } = useJournal(activeChild?.id);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    if (params.compose === "1") setComposing(true);
  }, [params.compose]);

  const firstName = activeChild?.name.split(" ")[0] ?? "Your little one";

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: top + 20 }]}>
          <Text variant="title" style={styles.title}>
            {firstName}&apos;s{" "}
            <Text variant="title" italic color={colors.sienna}>
              Journal
            </Text>
          </Text>
          <Text variant="caption" color={colors.inkMuted}>
            The things photos can&apos;t capture
          </Text>
        </View>

        {loading ? (
          <Loading label="Opening the journal…" />
        ) : (
          <View style={styles.list}>
            {data.map((entry, i) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                gradient={ENTRY_GRADIENTS[i % ENTRY_GRADIENTS.length]}
                onDelete={() =>
                  activeChild &&
                  deleteJournalEntry(activeChild.id, entry.id)
                }
              />
            ))}

            <Pressable
              style={styles.addCard}
              onPress={() => {
                haptics.tap();
                setComposing(true);
              }}
            >
              <Text style={styles.addIcon}>✍️</Text>
              <Text style={styles.addText}>
                What are you feeling right now?
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <ComposeModal
        visible={composing}
        onClose={() => setComposing(false)}
        onSave={async (text, mood, tags) => {
          if (!user || !activeChild) return;
          await createJournalEntry(user.uid, activeChild.id, { text, mood, tags });
          haptics.success();
        }}
      />
    </View>
  );
}

function JournalCard({
  entry,
  gradient,
  onDelete,
}: {
  entry: JournalEntry;
  gradient: [string, string];
  onDelete: () => void;
}) {
  return (
    <View style={styles.entry}>
      <View style={styles.tape} />
      {entry.mood ? <Text style={styles.mood}>{entry.mood}</Text> : null}
      <Text style={styles.entryDate}>
        {formatLongDateTime(entry.createdAt)}
      </Text>
      {entry.storagePath ? (
        <AssetImage
          storagePath={entry.storagePath}
          gradient={gradient}
          style={styles.entryPhoto}
        />
      ) : null}
      <Text style={styles.entryText}>{`“${entry.text}”`}</Text>
      {entry.tags.length > 0 ? (
        <View style={styles.tags}>
          {entry.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Pressable style={styles.delete} onPress={onDelete} hitSlop={8}>
        <Ionicons name="trash-outline" size={14} color={colors.inkMuted} />
      </Pressable>
    </View>
  );
}

function ComposeModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string, mood: string, tags: string[]) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState("🥰");
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setText("");
    setMood("🥰");
    setTags([]);
    setError(null);
  }

  async function save() {
    if (!text.trim()) {
      setError("Write a little something first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave(text, mood, tags);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modal}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={26} color={colors.ink} />
            </Pressable>
            <Eyebrow>New entry</Eyebrow>
            <View style={{ width: 26 }} />
          </View>

          <Text variant="caption" style={styles.modalLabel}>
            How are you feeling?
          </Text>
          <View style={styles.moods}>
            {MOODS.map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  haptics.tap();
                  setMood(m);
                }}
                style={[styles.moodBtn, mood === m && styles.moodActive]}
              >
                <Text style={styles.moodBtnEmoji}>{m}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Write it down before you forget…"
            placeholderTextColor={colors.inkMuted}
            multiline
            maxLength={LIMITS.journalText.max}
            style={styles.textArea}
          />

          <TagInput tags={tags} onChange={setTags} />

          {error ? (
            <Text variant="caption" color={colors.sienna} style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button label="Save entry →" onPress={save} loading={busy} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 32 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  title: { fontSize: 30, marginBottom: 4 },
  list: { padding: 20, gap: 16 },
  entry: {
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: 20,
  },
  tape: {
    position: "absolute",
    top: -6,
    alignSelf: "center",
    width: 44,
    height: 14,
    backgroundColor: "rgba(201,169,110,0.3)",
    borderRadius: 1,
  },
  mood: { position: "absolute", top: 16, right: 16, fontSize: 20 },
  entryDate: {
    fontFamily: fonts.sans,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.sienna,
    marginBottom: 10,
  },
  entryPhoto: { width: "100%", height: 120, borderRadius: radius.sm, marginBottom: 10 },
  entryText: { fontFamily: fonts.loraItalic, fontSize: 14, lineHeight: 24, color: colors.inkLight },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 14 },
  tag: { backgroundColor: colors.cream, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontFamily: fonts.sans, fontSize: 9, color: colors.inkMuted },
  delete: { position: "absolute", bottom: 14, right: 14, padding: 4 },
  addCard: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.hairlineStrong,
    borderRadius: radius.md,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  addIcon: { fontSize: 24 },
  addText: { fontFamily: fonts.serifItalic, fontSize: 16, color: colors.inkMuted },

  modal: { flex: 1, backgroundColor: colors.cream },
  modalScroll: { padding: 24, paddingBottom: 40 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalLabel: { marginBottom: 10, color: colors.inkMuted },
  moods: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  moodBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
  moodActive: { borderColor: colors.sienna, backgroundColor: colors.siennaTint },
  moodBtnEmoji: { fontSize: 20 },
  textArea: {
    minHeight: 160,
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: "rgba(196,169,160,0.35)",
    borderRadius: radius.sm,
    padding: 16,
    fontFamily: fonts.loraItalic,
    fontSize: 16,
    lineHeight: 26,
    color: colors.ink,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  error: { marginTop: 14 },
  saveBtn: { marginTop: 24 },
});
