import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
} from 'react-native';
import { Platform } from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { AppText } from './Text';

type Variant = 'primary' | 'outline' | 'ghost' | 'dark';

interface Props extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  onPress,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;

  const handlePress: PressableProps['onPress'] = (e) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.(e);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        VARIANTS[variant].container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...rest}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={VARIANTS[variant].textColor} />
        ) : (
          <AppText style={[styles.label, { color: VARIANTS[variant].textColor }]}>
            {label}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const VARIANTS: Record<Variant, { container: object; textColor: string }> = {
  primary: { container: { backgroundColor: colors.sienna }, textColor: colors.white },
  dark: { container: { backgroundColor: colors.ink }, textColor: colors.cream },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderStrong },
    textColor: colors.inkLight,
  },
  ghost: { container: { backgroundColor: 'transparent' }, textColor: colors.sienna },
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  disabled: { opacity: 0.5 },
});
