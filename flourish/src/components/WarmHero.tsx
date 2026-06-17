/**
 * WarmHero — layered gradient hero used on Welcome and Sign-in screens.
 *
 * Three gradient passes simulate the feel of a golden-hour photograph:
 *  1. Base dark warm brown
 *  2. Amber radial sweep from the top — like early morning light
 *  3. Soft sage bloom from bottom-right — adds depth
 *
 * No external image required. Entirely self-contained and looks beautiful.
 */
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function WarmHero({ children, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      {/* Warm amber sweep — top to bottom */}
      <LinearGradient
        colors={['rgba(200,140,80,0.55)', 'rgba(193,123,92,0.15)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Deep rose accent — top-left */}
      <LinearGradient
        colors={['rgba(180,90,70,0.3)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Sage depth — bottom-right */}
      <LinearGradient
        colors={['transparent', 'rgba(130,170,130,0.18)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 1, y: 1 }}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1008',
    overflow: 'hidden',
  },
});
