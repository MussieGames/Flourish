import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius } from '@/theme';

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

export function InfoBox({
  children,
  accent = colors.sageDark,
  tint = 'rgba(181,196,177,0.15)',
  style,
}: {
  children: React.ReactNode;
  accent?: string;
  tint?: string;
  style?: ViewProps['style'];
}) {
  return (
    <View style={[styles.infoBox, { backgroundColor: tint, borderLeftColor: accent }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  infoBox: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderLeftWidth: 2,
    borderRadius: radius.sm,
  },
});
