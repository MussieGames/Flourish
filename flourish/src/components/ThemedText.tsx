import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { Colors, Typography } from '../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: 'serif' | 'serifItalic' | 'sans' | 'story';
  size?: keyof typeof Typography.sizes;
  weight?: keyof typeof Typography.weights;
  color?: string;
  numberOfLines?: number;
  onPress?: () => void;
}

export function ThemedText({
  children,
  style,
  variant = 'sans',
  size = 'base',
  weight = 'regular',
  color = Colors.ink,
  numberOfLines,
  onPress,
}: Props) {
  const fontFamily = {
    serif: 'CormorantGaramond_300Light',
    serifItalic: 'CormorantGaramond_300Light_Italic',
    sans: 'DMSans_400Regular',
    story: 'Lora_400Regular_Italic',
  }[variant];

  return (
    <Text
      style={[
        {
          fontFamily,
          fontSize: Typography.sizes[size],
          color,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}
