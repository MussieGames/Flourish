import React from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "../../theme/tokens";
import { fonts } from "../../theme/typography";
import { Text } from "./Text";

/** The little uppercase label with a leading dash used throughout the design. */
export function Eyebrow({
  children,
  color = colors.sienna,
}: {
  children: string;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.dash, { backgroundColor: color }]} />
      <Text
        style={[styles.text, { color }]}
        accessibilityRole="header"
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dash: { width: 16, height: 1 },
  text: {
    fontFamily: fonts.sans,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
});
