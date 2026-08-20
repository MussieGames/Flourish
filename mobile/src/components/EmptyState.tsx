import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { AppText } from './Text';
import { Icon, type IconName } from './Icon';

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  subtitle,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={26} color={colors.sienna} />
      </View>
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
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(193,123,92,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sub: { marginTop: 6, maxWidth: 260 },
});
