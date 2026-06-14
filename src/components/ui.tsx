import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors, fontFamily, shadow, spacing } from "@/theme";

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <View style={styles.eyebrowRow}>
      <View style={[styles.eyebrowLine, light && { backgroundColor: colors.rose }]} />
      <Text style={[styles.eyebrow, light && { color: colors.rose }]}>{children}</Text>
    </View>
  );
}

export function SerifTitle({
  children,
  light = false,
  size = 32,
}: {
  children: React.ReactNode;
  light?: boolean;
  size?: number;
}) {
  return <Text style={[styles.serifTitle, { fontSize: size }, light && styles.lightText]}>{children}</Text>;
}

export function BodyText({
  children,
  light = false,
  style,
}: {
  children: React.ReactNode;
  light?: boolean;
  style?: ViewStyle;
}) {
  return <Text style={[styles.body, light && styles.lightBody, style]}>{children}</Text>;
}

export function FlourishButton({
  title,
  onPress,
  variant = "filled",
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: "filled" | "outline" | "dark";
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "outline" && styles.buttonOutline,
        variant === "dark" && styles.buttonDark,
        disabled && styles.buttonDisabled,
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "outline" && styles.buttonOutlineText,
          disabled && { opacity: 0.7 },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { icon?: string }) {
  return (
    <View style={styles.fieldWrap}>
      {props.icon ? <Text style={styles.fieldIcon}>{props.icon}</Text> : null}
      <TextInput
        {...props}
        placeholderTextColor={colors.inkMuted}
        secureTextEntry={props.secureTextEntry}
        style={[styles.field, props.icon ? styles.fieldWithIcon : null, props.style]}
      />
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function GradientCard({
  colors: gradientColors,
  children,
  style,
}: {
  colors: readonly [string, string];
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.gradient, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eyebrowLine: {
    width: 18,
    height: 1,
    backgroundColor: colors.sienna,
  },
  eyebrow: {
    color: colors.sienna,
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  serifTitle: {
    color: colors.ink,
    fontFamily: fontFamily.serifLight,
    lineHeight: 36,
  },
  lightText: {
    color: colors.cream,
  },
  body: {
    color: colors.inkLight,
    fontFamily: fontFamily.sans,
    fontSize: 14,
    lineHeight: 23,
  },
  lightBody: {
    color: "rgba(251,247,242,0.68)",
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.sienna,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 18,
    ...shadow.glow,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderColor: "rgba(196,169,160,0.45)",
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonDark: {
    backgroundColor: colors.ink,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  buttonOutlineText: {
    color: colors.inkLight,
  },
  fieldWrap: {
    marginBottom: spacing.md,
    position: "relative",
  },
  fieldIcon: {
    fontSize: 18,
    left: 16,
    position: "absolute",
    top: 17,
    zIndex: 1,
  },
  field: {
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.38)",
    borderRadius: 8,
    borderWidth: 1.5,
    color: colors.ink,
    fontFamily: fontFamily.sans,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  fieldWithIcon: {
    paddingLeft: 48,
  },
  card: {
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.22)",
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadow.soft,
  },
  gradient: {
    borderRadius: 14,
    overflow: "hidden",
  },
});
