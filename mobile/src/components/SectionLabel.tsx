import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { AppText } from './Text';

export function SectionLabel({
  children,
  color = colors.sienna,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: color }]} />
      <AppText variant="label" color={color}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  line: { width: 14, height: 1 },
});
