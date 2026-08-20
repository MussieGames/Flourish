import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { colors } from '@/theme';

/**
 * The Flourish brand mark — a fine leaf line icon (replaces the 🌿 emoji).
 * Optionally "blooms" in on mount: a gentle scale + rotate that signals the
 * brand is alive and growing, without being theatrical.
 */
export function BrandMark({
  size = 30,
  color = colors.sage,
  bloom = false,
}: {
  size?: number;
  color?: string;
  bloom?: boolean;
}) {
  const anim = useRef(new Animated.Value(bloom ? 0 : 1)).current;

  useEffect(() => {
    if (!bloom) return;
    Animated.timing(anim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();
  }, [anim, bloom]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['-20deg', '0deg'] });

  return (
    <Animated.View style={{ opacity: anim, transform: [{ scale }, { rotate }] }}>
      <Ionicons name="leaf-outline" size={size} color={color} />
    </Animated.View>
  );
}
