import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const DEVICE_LOCK_KEY = "flourish.deviceLock.enabled";

export async function getDeviceLockEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(DEVICE_LOCK_KEY)) === "true";
}

export async function setDeviceLockEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(DEVICE_LOCK_KEY, String(enabled), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
}

export async function canUseDeviceLock(): Promise<boolean> {
  const [hardware, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync()
  ]);
  return hardware && enrolled;
}

export async function unlockPrivateMemories(): Promise<boolean> {
  const available = await canUseDeviceLock();
  if (!available) {
    return true;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock Flourish",
    cancelLabel: "Not now",
    disableDeviceFallback: false
  });

  return result.success;
}
