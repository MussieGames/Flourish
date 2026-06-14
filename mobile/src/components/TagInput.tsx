import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { colors, radius } from "../theme/tokens";
import { fonts } from "../theme/typography";
import { Text } from "./ui/Text";
import { LIMITS, sanitizeTags } from "../lib/validation";
import { haptics } from "../lib/haptics";

interface Props {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function add() {
    const next = sanitizeTags([...tags, draft]);
    onChange(next);
    setDraft("");
    haptics.tap();
  }

  function remove(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Add a tag…"
          placeholderTextColor={colors.inkMuted}
          style={styles.input}
          maxLength={LIMITS.tag.max}
          onSubmitEditing={add}
          returnKeyType="done"
          autoCapitalize="none"
        />
        <Pressable
          onPress={add}
          disabled={!draft.trim() || tags.length >= LIMITS.tagsCount}
          style={styles.addBtn}
        >
          <Text variant="caption" color={colors.sienna}>
            Add
          </Text>
        </Pressable>
      </View>
      {tags.length > 0 ? (
        <View style={styles.chips}>
          {tags.map((t) => (
            <Pressable key={t} style={styles.chip} onPress={() => remove(t)}>
              <Text style={styles.chipText}>{t}</Text>
              <Text style={styles.chipX}>×</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: "rgba(196,169,160,0.35)",
    borderRadius: radius.sm,
    paddingHorizontal: 16,
  },
  input: { flex: 1, paddingVertical: 14, fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  addBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.cream,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontFamily: fonts.sans, fontSize: 11, color: colors.inkMuted },
  chipX: { fontSize: 14, color: colors.inkMuted },
});
