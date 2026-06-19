/**
 * ReviewPrompt — Flourish-branded gate screen before the native App Store dialog.
 *
 * Why this exists:
 *   Apple/Google's native review dialog cannot be customised at all —
 *   the star prompt, text, and buttons are entirely OS-controlled.
 *   Showing it directly risks negative ratings from users who are having
 *   a bad day but love the app.
 *
 *   This component shows Flourish's own screen first:
 *     "Are you loving Flourish?"  [Yes, it's wonderful] / [Not quite yet]
 *
 *   Only parents who tap "Yes" ever see the native dialog.
 *   Parents who tap "Not quite yet" are offered a feedback email instead.
 *   This produces near-exclusively 4–5 star reviews.
 *
 * Trigger point:
 *   The Milestone Moment screen — after capturing a "first" — is the
 *   highest-emotion moment in the app. That's where this appears.
 *   It only shows once per install (stored in SecureStore).
 *
 * Usage:
 *   const { shouldShow, show, ReviewPromptModal } = useReviewPrompt();
 *   // After milestone capture: if (shouldShow) show();
 *   // Render: {ReviewPromptModal}
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import * as StoreReview from 'expo-store-review';
import * as SecureStore from 'expo-secure-store';
import { Colors, Typography, Spacing } from '../constants/theme';
import {
  trackReviewPrePromptShown,
  trackReviewResponsePositive,
  trackReviewResponseNegative,
  trackNativeReviewRequested,
} from '../services/analytics';

const REVIEW_SHOWN_KEY = 'flourish_review_shown';
const SUPPORT_EMAIL = 'hello@flourish.app';

export function useReviewPrompt() {
  const [visible, setVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const show = useCallback(async () => {
    // Only show once per install
    const alreadyShown = await SecureStore.getItemAsync(REVIEW_SHOWN_KEY);
    if (alreadyShown) return;
    await SecureStore.setItemAsync(REVIEW_SHOWN_KEY, 'true');
    trackReviewPrePromptShown();
    setVisible(true);
    setHasShown(true);
  }, []);

  const checkShouldShow = useCallback(async (): Promise<boolean> => {
    if (hasShown) return false;
    const alreadyShown = await SecureStore.getItemAsync(REVIEW_SHOWN_KEY);
    return !alreadyShown;
  }, [hasShown]);

  const handlePositive = useCallback(async () => {
    setVisible(false);
    trackReviewResponsePositive();
    const isAvailable = await StoreReview.isAvailableAsync();
    if (isAvailable) {
      trackNativeReviewRequested();
      await StoreReview.requestReview();
    }
  }, []);

  const handleNegative = useCallback(() => {
    setVisible(false);
    trackReviewResponseNegative();
    // Open feedback email
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=Flourish feedback&body=Here's what could be better: `
    );
  }, []);

  const ReviewPromptModal = (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Warm decorative orb */}
          <View style={styles.orb} pointerEvents="none" />

          <Text style={styles.emoji}>🌿</Text>

          <Text style={styles.title}>
            Are you loving{'\n'}
            <Text style={styles.titleItalic}>Flourish?</Text>
          </Text>

          <Text style={styles.body}>
            If the app has helped you capture even one moment you'd have
            otherwise forgotten, we'd be so grateful for a review. It helps
            other parents find us.
          </Text>

          {/* Positive — triggers native review */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handlePositive}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>YES, IT'S WONDERFUL →</Text>
          </TouchableOpacity>

          {/* Negative — routes to feedback, skips native dialog */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleNegative}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Not quite yet — share feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.dismissBtnText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return { show, checkShouldShow, ReviewPromptModal };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,20,16,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  card: {
    backgroundColor: Colors.ink,
    borderRadius: 16,
    padding: Spacing['3xl'],
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(193,123,92,0.2)',
    top: -80,
    right: -80,
  },
  emoji: { fontSize: 40, marginBottom: Spacing.xl, zIndex: 1 },
  title: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 32,
    color: Colors.cream,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: Spacing.xl,
    zIndex: 1,
  },
  titleItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.rose,
  },
  body: {
    fontFamily: 'DMSans_300Light',
    fontSize: Typography.sizes.sm,
    color: 'rgba(251,247,242,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing['3xl'],
    zIndex: 1,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.sienna,
    borderRadius: 2,
    alignItems: 'center',
    marginBottom: Spacing.md,
    zIndex: 1,
  },
  primaryBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    letterSpacing: 1.2,
    color: '#fff',
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignItems: 'center',
    marginBottom: Spacing.md,
    zIndex: 1,
  },
  secondaryBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: 'rgba(251,247,242,0.6)',
  },
  dismissBtn: { paddingVertical: 8, zIndex: 1 },
  dismissBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: 'rgba(251,247,242,0.3)',
    textDecorationLine: 'underline',
  },
});
