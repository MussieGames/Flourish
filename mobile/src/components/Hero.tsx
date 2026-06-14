import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors } from '@/theme';

interface Props {
  children: React.ReactNode;
  /** Tint of the soft glow behind the content. */
  glow?: string;
  style?: ViewStyle;
  paddingTop?: number;
}

/**
 * The signature Flourish dark hero with a warm radial-style glow. Approximates
 * the web's radial-gradient using stacked linear gradients for a calm,
 * night-friendly feel.
 */
export function Hero({ children, glow = 'rgba(193,123,92,0.22)', style, paddingTop = 64 }: Props) {
  return (
    <View style={[styles.hero, { paddingTop }, style]}>
      <LinearGradient
        colors={[glow, 'transparent']}
        start={{ x: 0.8, y: 1 }}
        end={{ x: 0.2, y: 0 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  content: { position: 'relative' },
});
