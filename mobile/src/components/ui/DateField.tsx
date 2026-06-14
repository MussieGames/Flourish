import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { colors, radius } from "../../theme/tokens";
import { fonts } from "../../theme/typography";
import { formatShortDate } from "../../lib/date";
import { Text } from "./Text";

interface Props {
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
  leadingEmoji?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export function DateField({
  value,
  onChange,
  placeholder = "Select a date",
  leadingEmoji,
  maximumDate,
  minimumDate,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setOpen(false);
    if (event.type === "set" && selected) {
      onChange(selected);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.field}
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        {leadingEmoji ? <Text style={styles.emoji}>{leadingEmoji}</Text> : null}
        <Text
          style={[styles.text, !value && styles.placeholder]}
        >
          {value ? formatShortDate(value) : placeholder}
        </Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: "rgba(196,169,160,0.35)",
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emoji: { fontSize: 18 },
  text: { fontFamily: fonts.serifItalic, fontSize: 22, color: colors.ink },
  placeholder: { color: colors.inkMuted },
});
