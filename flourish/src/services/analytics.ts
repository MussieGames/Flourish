/**
 * Analytics — PostHog event tracking.
 *
 * Every meaningful user action is tracked here so product decisions
 * can be made from data, not guesses.
 *
 * Required env var:
 *   EXPO_PUBLIC_POSTHOG_API_KEY   — get from posthog.com (free tier is generous)
 *   EXPO_PUBLIC_POSTHOG_HOST      — defaults to https://app.posthog.com
 *
 * All events follow the pattern:  verb_noun  (e.g. captured_milestone)
 * User identity: Firebase uid (never email or name — privacy first)
 */
import PostHog from 'posthog-react-native';

let _client: PostHog | null = null;

export function getAnalytics(): PostHog | null {
  if (_client) return _client;
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  if (!apiKey) return null; // analytics disabled in dev without key

  _client = new PostHog(apiKey, {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    // Flush events every 30 seconds or every 20 events, whichever comes first
    flushAt: 20,
    flushInterval: 30000,
    // Respect user privacy — no automatic session recording
    sendFeatureFlagEvent: false,
    preloadFeatureFlags: false,
  });

  return _client;
}

// ─── Identity ─────────────────────────────────────────────────────────────────
export function identifyUser(uid: string) {
  getAnalytics()?.identify(uid);
}

export function resetAnalyticsUser() {
  getAnalytics()?.reset();
}

// ─── Events — grouped by area ─────────────────────────────────────────────────

// Onboarding
export function trackOnboardingStarted() { track('onboarding_started'); }
export function trackOnboardingCompleted(babyName: string) { track('onboarding_completed', { baby_name_length: babyName.length as number }); }
export function trackOnboardingSkipped(step: 1 | 2) { track('onboarding_skipped', { step: step as number }); }

// Auth
export function trackSignedUp() { track('signed_up'); }
export function trackSignedIn() { track('signed_in'); }
export function trackSignedOut() { track('signed_out'); }
export function trackPasswordReset() { track('password_reset_requested'); }

// Baby profile
export function trackBabyAdded() { track('baby_added'); }
export function trackChildSwitched() { track('child_switched'); }

// Memories
export function trackMemoryCaptured(type: 'photo' | 'video' | 'journal') { track('memory_captured', { type }); }
export function trackMemoryViewed() { track('memory_viewed'); }

// Milestones
export function trackMilestoneCaptured(milestoneId: string) { track('milestone_captured', { milestone_id: milestoneId }); }
export function trackMilestoneCelebrationViewed(milestoneId: string) { track('milestone_celebration_viewed', { milestone_id: milestoneId }); }

// Journal
export function trackJournalEntryCreated(hasMood: boolean, hasPhoto: boolean, tagCount: number) {
  track('journal_entry_created', { has_mood: hasMood, has_photo: hasPhoto, tag_count: tagCount });
}

// Stickers
export function trackStickerApplied(era: string, stickerName: string) { track('sticker_applied', { era, sticker_name: stickerName }); }

// Upgrade / monetisation
export function trackUpgradeScreenViewed(planId: 'seedling' | 'bloom' | 'heirloom') { track('upgrade_screen_viewed', { current_plan: planId }); }
export function trackUpgradeTapped(targetPlan: string, billingCycle: string) { track('upgrade_tapped', { target_plan: targetPlan, billing_cycle: billingCycle }); }
export function trackSeedlingLimitReached(photoCount: number) { track('seedling_limit_reached', { photo_count: photoCount }); }
export function trackSeedlingNudgeShown(threshold: '75pct' | '90pct' | 'limit') { track('seedling_nudge_shown', { threshold }); }

// Review / NPS
export function trackReviewPrePromptShown() { track('review_pre_prompt_shown'); }
export function trackReviewResponsePositive() { track('review_response_positive'); }
export function trackReviewResponseNegative() { track('review_response_negative'); }
export function trackNativeReviewRequested() { track('native_review_requested'); }

// Notifications
export function trackNotificationPermissionGranted() { track('notification_permission_granted'); }
export function trackNotificationPermissionDenied() { track('notification_permission_denied'); }

// ─── Internal helper ──────────────────────────────────────────────────────────
function track(event: string, properties?: Record<string, string | number | boolean | null>) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAnalytics()?.capture(event, properties as any);
  } catch {
    // Never let analytics crash the app
  }
}
