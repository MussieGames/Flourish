import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../../theme/tokens";

interface Props {
  children: React.ReactNode;
  /** Glow colour (defaults to the warm sienna used in the mockup heroes). */
  glow?: string;
  background?: string;
  style?: ViewStyle;
  /** Corner the glow emanates from. */
  glowCorner?: "top-right" | "bottom-left" | "bottom-right" | "center";
}

const cornerToPoints: Record<
  NonNullable<Props["glowCorner"]>,
  { start: { x: number; y: number }; end: { x: number; y: number } }
> = {
  "top-right": { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
  "bottom-left": { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },
  "bottom-right": { start: { x: 1, y: 1 }, end: { x: 0, y: 0 } },
  center: { start: { x: 0.5, y: 1 }, end: { x: 0.5, y: 0 } },
};

/**
 * Dark header section with a soft warm glow. We approximate the web mockup's
 * `radial-gradient` with a low-opacity linear gradient — close enough visually
 * while staying fully native.
 */
export function GlowHeader({
  children,
  glow = "rgba(193,123,92,0.22)",
  background = colors.ink,
  style,
  glowCorner = "center",
}: Props) {
  const pts = cornerToPoints[glowCorner];
  return (
    <View style={[styles.container, { backgroundColor: background }, style]}>
      <LinearGradient
        colors={[glow, "transparent"]}
        start={pts.start}
        end={pts.end}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  content: { position: "relative", zIndex: 1 },
});
