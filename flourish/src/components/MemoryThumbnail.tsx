/**
 * MemoryThumbnail — shows a real photo if mediaURL exists, otherwise a warm
 * gradient fallback with an emoji. Keeps the grid beautiful before any photos
 * are captured, and real once they are.
 */
import React from 'react';
import { View, Image, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Memory } from '../types';

const FALLBACK_GRADIENTS: [string, string][] = [
  ['#E8C4B0', '#C4907A'],
  ['#C5D4C0', '#A8BFA8'],
  ['#E8D5B0', '#D4B880'],
  ['#D4C4D8', '#B4A0C0'],
];

const FALLBACK_EMOJIS = ['🍼', '😴', '👣', '🤱', '📸', '🌿', '💛', '⭐'];

interface Props {
  memory: Memory;
  index: number;
  style?: StyleProp<ViewStyle>;
  /** Height of the thumbnail area. Defaults to 90. */
  height?: number;
}

export function MemoryThumbnail({ memory, index, style, height = 90 }: Props) {
  const gradientColors = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const fallbackEmoji = FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length];

  if (memory.mediaURL) {
    return (
      <Image
        source={{ uri: memory.mediaURL }}
        style={[{ height }, styles.photo, style as object]}
        resizeMode="cover"
        accessibilityLabel={memory.title}
      />
    );
  }

  // Graceful fallback while there's no photo yet
  return (
    <LinearGradient
      colors={gradientColors}
      style={[{ height }, styles.gradient, style as object]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.emoji}>{fallbackEmoji}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
  },
  gradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 32 },
});
