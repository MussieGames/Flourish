import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

interface Props {
  children: string;
  color?: string;
  style?: object;
}

export function EyebrowLabel({ children, color = Colors.sienna, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.line, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{children.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  line: { width: 14, height: 1 },
  text: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    letterSpacing: 1.8,
  },
});
