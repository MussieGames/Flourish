import React from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "../../theme/tokens";
import { fonts } from "../../theme/typography";
import { Text } from "./Text";

/** The sage-tinted privacy reassurance block used in the mockup. */
export function Reassure({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.sageTint,
    borderLeftWidth: 2,
    borderLeftColor: colors.sageDark,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.sageDark,
    marginBottom: 4,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.inkLight,
  },
});
