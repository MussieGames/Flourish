import React from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "../theme/tokens";
import { Text } from "./ui/Text";
import { checkPassword } from "../lib/validation";

const BAR_COLORS = [
  colors.hairlineStrong,
  "#D98C6A",
  colors.gold,
  colors.sage,
  colors.sageDark,
];
const LABELS = ["", "Weak", "Fair", "Good", "Strong"];

export function PasswordMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, reasons } = checkPassword(password);

  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor:
                  i < score ? BAR_COLORS[score] : colors.hairline,
              },
            ]}
          />
        ))}
      </View>
      <Text variant="caption" color={colors.inkMuted}>
        {reasons[0] ?? `${LABELS[score]} password`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginTop: 2 },
  bars: { flexDirection: "row", gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
});
