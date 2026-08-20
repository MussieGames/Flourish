import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

/**
 * Line-drawn fern frond — the Flourish brand mark.
 * Same stroke language as the Ionicons outline set (round caps, ~1.6 weight).
 * Not a generic leaf icon.
 */
export const FERN_PATHS = [
  'M12 21.5c-.2-5 .3-10.5 0-18',
  'M12 18.8c-3.6-.8-5.8-2.8-7-5.2',
  'M12 18.8c3.6-.8 5.8-2.8 7-5.2',
  'M12 15.6c-3.2-.7-5-2.4-6-4.5',
  'M12 15.6c3.2-.7 5-2.4 6-4.5',
  'M12 12.4c-2.6-.6-4.2-2-5-3.8',
  'M12 12.4c2.6-.6 4.2-2 5-3.8',
  'M12 9.4c-2-.5-3.2-1.6-3.7-3',
  'M12 9.4c2-.5 3.2-1.6 3.7-3',
  'M12 6.6c-1.4-.4-2.2-1.2-2.5-2.2',
  'M12 6.6c1.4-.4 2.2-1.2 2.5-2.2',
  'M12 4.4c-.6-.6-.8-1.3-.5-2',
  'M12 4.4c.6-.6.8-1.3.5-2',
] as const;

export function FernGlyph({
  size = 30,
  color = colors.sage,
  strokeWidth = 1.6,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {FERN_PATHS.map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

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
      <FernGlyph size={size} color={color} />
    </Animated.View>
  );
}
