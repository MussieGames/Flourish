import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius } from "../../theme/tokens";
import { fonts } from "../../theme/typography";
import { Text } from "./Text";

interface Props extends TextInputProps {
  leadingEmoji?: string;
  /** Use the elegant serif italic styling (welcome screen). */
  serif?: boolean;
  error?: string | null;
  secureToggle?: boolean;
}

export function TextField({
  leadingEmoji,
  serif = false,
  error,
  secureToggle = false,
  style,
  secureTextEntry,
  ...rest
}: Props) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.field,
          focused && styles.focused,
          error ? styles.errored : null,
        ]}
      >
        {leadingEmoji ? (
          <Text style={styles.emoji}>{leadingEmoji}</Text>
        ) : null}
        <TextInput
          {...rest}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.inkMuted}
          style={[
            styles.input,
            serif ? styles.serifInput : styles.sansInput,
            style,
          ]}
        />
        {secureToggle ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.inkMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" color={colors.sienna} style={styles.errorText}>
          {error}
        </Text>
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
  },
  focused: { borderColor: colors.sienna },
  errored: { borderColor: colors.sienna },
  emoji: { fontSize: 18 },
  input: { flex: 1, paddingVertical: 16, color: colors.ink },
  serifInput: {
    fontFamily: fonts.serifItalic,
    fontSize: 22,
  },
  sansInput: { fontFamily: fonts.sans, fontSize: 15 },
  errorText: { marginTop: 6 },
});
