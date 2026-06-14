import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { colors, radius, shadow } from "../../theme/tokens";
import { fonts } from "../../theme/typography";
import { haptics } from "../../lib/haptics";
import { Text } from "./Text";

type Variant = "primary" | "outline" | "secondary" | "ghost";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  /** Render lighter for dark backgrounds. */
  onDark?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  onDark = false,
}: Props) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    haptics.tap();
    onPress?.();
  };

  const containerStyle: ViewStyle[] = [styles.base];
  let textColor = colors.white;

  if (variant === "primary") {
    containerStyle.push(styles.primary);
  } else if (variant === "outline") {
    containerStyle.push(onDark ? styles.outlineDark : styles.outline);
    textColor = onDark ? colors.creamOn65 : colors.inkLight;
  } else if (variant === "secondary") {
    containerStyle.push(styles.secondary);
    textColor = colors.creamOn65;
  } else {
    containerStyle.push(styles.ghost);
    textColor = colors.sienna;
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        ...containerStyle,
        variant === "primary" && shadow.lifted,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 17,
    paddingHorizontal: 18,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  primary: { backgroundColor: colors.sienna },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
  },
  outlineDark: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.creamOn10,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }] },
});
