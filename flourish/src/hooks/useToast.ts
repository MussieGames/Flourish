/**
 * useToast — in-app toast that replaces Alert.alert().
 *
 * Usage in any screen:
 *   const { showToast, ToastView } = useToast();
 *   showToast('Saved 🌿', 'Your entry has been preserved.');
 *   // Render <>{ToastView}</> at the bottom of your JSX.
 *
 * No Context. No Provider. Import, use, done.
 */
import { useState, useRef, useCallback } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { Colors, Typography, Spacing } from '../constants/theme';

interface ToastState {
  visible: boolean;
  message: string;
  subtitle?: string;
  variant: 'success' | 'error';
}

export function useToast() {
  const [state, setState] = useState<ToastState>({
    visible: false,
    message: '',
    variant: 'success',
  });
  const slideAnim = useRef(new Animated.Value(80)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, subtitle?: string, variant: 'success' | 'error' = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setState({ visible: true, message, subtitle, variant });

      // Slide up
      slideAnim.setValue(80);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 90,
        friction: 11,
      }).start();

      // Auto-dismiss after 3 s
      timer.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 80,
          duration: 280,
          useNativeDriver: true,
        }).start(() => setState((prev) => ({ ...prev, visible: false })));
      }, 3000);
    },
    [slideAnim]
  );

  const ToastView = state.visible
    ? React.createElement(
        Animated.View,
        {
          style: [
            styles.toast,
            state.variant === 'error' && styles.toastError,
            { transform: [{ translateY: slideAnim }] },
          ],
          pointerEvents: 'none' as const,
        },
        React.createElement(
          View,
          { style: styles.toastInner },
          React.createElement(
            View,
            { style: [styles.accent, state.variant === 'error' && styles.accentError] }
          ),
          React.createElement(
            View,
            { style: styles.textWrap },
            React.createElement(Text, { style: styles.message }, state.message),
            state.subtitle
              ? React.createElement(Text, { style: styles.subtitle }, state.subtitle)
              : null
          )
        )
      )
    : null;

  return { showToast, ToastView };
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(44,36,32,0.94)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 999,
  },
  toastError: {
    backgroundColor: 'rgba(80,20,20,0.94)',
  },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accent: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: Colors.sageDark,
    minHeight: 44,
  },
  accentError: {
    backgroundColor: '#e57373',
  },
  textWrap: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    gap: 2,
  },
  message: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.cream,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: 'rgba(251,247,242,0.55)',
  },
});
