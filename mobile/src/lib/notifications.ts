import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { upcomingReminderJobs, isFlourishReminderId, type ReminderJob } from './milestoneSchedule';

const ENABLED_KEY = 'flourish.reminders.enabled';
const PROMPTED_KEY = 'flourish.reminders.prompted';
const CHANNEL_ID = 'milestones';

function native(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/** Must run at import time so foreground notifications can display. */
if (native()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Milestone reminders',
    description: 'Gentle heads-ups when a first is likely near — never a check-up alarm.',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 120],
    lightColor: '#C17B5C',
  });
}

export type ReminderPermission = 'granted' | 'denied' | 'undetermined';

export async function getReminderPermission(): Promise<ReminderPermission> {
  if (!native()) return 'undetermined';
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

export async function requestReminderPermission(): Promise<boolean> {
  if (!native()) return false;
  try {
    await ensureChannel();
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return true;
    const next = await Notifications.requestPermissionsAsync();
    return next.status === 'granted';
  } catch {
    return false;
  }
}

export async function loadReminderPrefs(): Promise<{ enabled: boolean; prompted: boolean }> {
  try {
    const [enabled, prompted] = await Promise.all([
      AsyncStorage.getItem(ENABLED_KEY),
      AsyncStorage.getItem(PROMPTED_KEY),
    ]);
    return { enabled: enabled === '1', prompted: prompted === '1' };
  } catch {
    return { enabled: false, prompted: false };
  }
}

export async function saveReminderEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(ENABLED_KEY, enabled ? '1' : '0');
  await AsyncStorage.setItem(PROMPTED_KEY, '1');
}

export async function markRemindersPrompted(): Promise<void> {
  await AsyncStorage.setItem(PROMPTED_KEY, '1');
}

export async function cancelFlourishReminders(): Promise<void> {
  if (!native()) return;
  try {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      pending
        .filter((n) => isFlourishReminderId(n.identifier))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    /* native module missing (Expo Go / web) */
  }
}

async function scheduleJob(job: ReminderJob): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: job.identifier,
    content: {
      title: job.title,
      body: job.body,
      sound: false,
      data: {
        screen: 'milestone',
        key: job.key,
        kind: job.kind,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: job.date,
      channelId: CHANNEL_ID,
    },
  });
}

export async function rescheduleMilestoneReminders(input: {
  enabled: boolean;
  birthDate: string | null | undefined;
  babyName: string;
  capturedKeys: Iterable<string>;
}): Promise<number> {
  if (!native()) return 0;
  await cancelFlourishReminders();
  if (!input.enabled) return 0;

  const permission = await getReminderPermission();
  if (permission !== 'granted') return 0;

  await ensureChannel();
  const jobs = upcomingReminderJobs(input);
  for (const job of jobs) {
    try {
      await scheduleJob(job);
    } catch {
      /* skip a single bad date rather than failing the batch */
    }
  }
  return jobs.length;
}

export function parseReminderResponse(data: Record<string, unknown> | undefined | null): {
  key: string;
} | null {
  if (!data || data.screen !== 'milestone') return null;
  const key = typeof data.key === 'string' ? data.key : null;
  return key ? { key } : null;
}

export function subscribeReminderResponses(handler: (key: string) => void): () => void {
  if (!native()) return () => {};
  const seen = new Set<string>();
  const go = (response: Notifications.NotificationResponse | null) => {
    if (!response) return;
    const id = response.notification.request.identifier;
    if (seen.has(id)) return;
    seen.add(id);
    const parsed = parseReminderResponse(
      response.notification.request.content.data as Record<string, unknown>,
    );
    if (parsed) handler(parsed.key);
    Notifications.clearLastNotificationResponseAsync().catch(() => {});
  };
  const sub = Notifications.addNotificationResponseReceivedListener(go);
  Notifications.getLastNotificationResponseAsync().then(go).catch(() => {});
  return () => sub.remove();
}
