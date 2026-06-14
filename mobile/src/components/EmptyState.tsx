import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { AppText } from './Text';

export function EmptyState({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrap}>
      <AppText style={styles.emoji}>{emoji}</AppText>
      <AppText variant="titleItalic" color={colors.inkMuted} center>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" center style={styles.sub}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emoji: { fontSize: 40, marginBottom: 12 },
  sub: { marginTop: 6, maxWidth: 260 },
});
