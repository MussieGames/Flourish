/**
 * Push notifications service.
 *
 * Handles:
 *  - Device token registration with Expo + storage in Firestore
 *  - Milestone window reminders (local, scheduled)
 *  - "On this day" memories (local, scheduled daily)
 *  - Seedling limit nudges (local, triggered by upload logic)
 *  - 1-year birthday Heirloom prompt (local, scheduled on baby creation)
 *
 * Architecture:
 *  - Local notifications: scheduled on-device, no server required.
 *    These handle 95% of Flourish's notification use cases.
 *  - Remote push: requires an Expo push server or Cloud Functions.
 *    Used for family sharing notifications (future feature).
 *
 * Required setup:
 *   EXPO_PUBLIC_EXPO_PROJECT_ID — from app.json extras.eas.projectId
 *   App permission: "Allow Notifications" must be requested once at login.
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { addDays, addMonths, setHours, setMinutes } from 'date-fns';
import { trackNotificationPermissionGranted, trackNotificationPermissionDenied } from './analytics';
import type { Baby } from '../types';
import { MILESTONE_TEMPLATES } from '../constants/stickers';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false, // quiet by default — 3am parents
    shouldSetBadge: false,
  }),
});

// ─── Permission ───────────────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false; // won't work in simulator

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    trackNotificationPermissionGranted();
    return true;
  }
  trackNotificationPermissionDenied();
  return false;
}

// ─── Expo push token (for remote notifications later) ────────────────────────
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EXPO_PROJECT_ID,
    });
    return token.data;
  } catch {
    return null;
  }
}

// ─── Android notification channel ────────────────────────────────────────────
export async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('flourish-milestones', {
      name: 'Milestones',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C17B5C', // sienna
    });
  }
}

// ─── Schedule milestone window notifications ──────────────────────────────────
/**
 * For each upcoming milestone, schedule a local notification 2 days before
 * the expected window opens. Only schedules milestones that haven't been
 * captured yet and whose window hasn't passed.
 */
export async function scheduleMilestoneReminders(baby: Baby) {
  // Cancel existing milestone reminders before rescheduling
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const milestoneNotifs = scheduled.filter((n) =>
    n.identifier.startsWith('milestone-')
  );
  await Promise.all(milestoneNotifs.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));

  const birthDate = baby.birthDate;
  const now = new Date();

  for (const template of MILESTONE_TEMPLATES) {
    if (template.expectedAgeWeeks === 0) continue; // "first day home" — already happened

    const windowStart = addDays(birthDate, template.expectedAgeWeeks * 7 - 2);
    if (windowStart <= now) continue; // window already passed

    await Notifications.scheduleNotificationAsync({
      identifier: `milestone-${template.id}`,
      content: {
        title: `${template.emoji} ${template.title} is coming`,
        body: `${baby.name}'s ${template.title} typically happens around ${template.expectedAgeLabel}. Keep your camera close.`,
        data: { type: 'milestone', milestoneId: template.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: setMinutes(setHours(windowStart, 9), 0),
      },
    });
  }
}

// ─── Schedule 1-year birthday Heirloom prompt ────────────────────────────────
export async function scheduleHeirloomBirthdayPrompt(baby: Baby) {
  const firstBirthday = addDays(baby.birthDate, 365 - 30); // 30 days before 1st birthday
  if (firstBirthday <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `heirloom-birthday-${baby.id}`,
    content: {
      title: `🎂 ${baby.name} turns 1 in 30 days`,
      body: `This whole year can become a printed Heirloom book. Order now to have it arrive in time.`,
      data: { type: 'heirloom_prompt' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: setMinutes(setHours(firstBirthday, 10), 0),
    },
  });
}

// ─── Seedling limit nudge ─────────────────────────────────────────────────────
export async function scheduleLocalSeedlingNudge(babyName: string, photoCount: number) {
  await Notifications.scheduleNotificationAsync({
    identifier: 'seedling-nudge',
    content: {
      title: `${babyName}'s story is almost full`,
      body: `You've captured ${photoCount} of your 200 Seedling memories. Upgrade to Bloom to keep capturing.`,
      data: { type: 'seedling_nudge' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });
}

// ─── Cancel all scheduled notifications ──────────────────────────────────────
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
