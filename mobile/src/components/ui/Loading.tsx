import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "../../theme/tokens";
import { Text } from "./Text";

export function Loading({
  label,
  dark = false,
}: {
  label?: string;
  dark?: boolean;
}) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: dark ? colors.ink : colors.cream },
      ]}
    >
      <ActivityIndicator color={dark ? colors.rose : colors.sienna} />
      {label ? (
        <Text
          variant="caption"
          color={dark ? colors.creamOn45 : colors.inkMuted}
          style={styles.label}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  label: { marginTop: 4 },
});
