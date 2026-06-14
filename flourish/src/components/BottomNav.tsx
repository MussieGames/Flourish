import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import { Colors, Typography } from '../constants/theme';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home', route: '/(tabs)/' },
  { icon: '📸', label: 'Capture', route: '/(tabs)/capture' },
  { icon: '📖', label: 'Scrapbook', route: '/(tabs)/scrapbook' },
  { icon: '⭐', label: 'Firsts', route: '/(tabs)/firsts' },
  { icon: '👤', label: 'Profile', route: '/(tabs)/profile' },
] as const;

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const currentPath = '/' + segments.join('/');

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = currentPath.includes(item.route.replace('/(tabs)', '').replace('/', '') || 'home');
        return (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            onPress={() => router.push(item.route as never)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.activeIcon]}>
              {item.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(254,252,249,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(196,169,160,0.2)',
    paddingTop: 10,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  icon: { fontSize: 20 },
  activeIcon: { transform: [{ scale: 1.1 }] },
  label: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs - 1,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.inkMedium,
  },
  activeLabel: { color: Colors.sienna },
});
