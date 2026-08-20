import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { colors } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Single, cohesive icon system for the whole app — thin Ionicons "outline"
 * line icons for a calm, premium, grown-up feel (no cartoon emoji in chrome).
 * Centralising here means we can restyle every icon from one place.
 */
export function Icon({
  name,
  size = 20,
  color = colors.ink,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: ComponentProps<typeof Ionicons>['style'];
}) {
  return <Ionicons name={name} size={size} color={color} style={style} />;
}
