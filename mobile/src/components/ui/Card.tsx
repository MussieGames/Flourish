import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, radius, shadow } from "../../theme/tokens";

export function Card({
  children,
  style,
  soft = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  soft?: boolean;
}) {
  return (
    <View style={[styles.card, soft && shadow.soft, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.warm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
});
