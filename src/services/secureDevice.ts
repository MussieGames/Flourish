import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const LAST_EMAIL_KEY = "flourish.lastEmail";
const APP_LOCK_KEY = "flourish.appLockEnabled";

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function saveLastEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(LAST_EMAIL_KEY, email.trim().toLowerCase(), secureOptions);
}

export async function getLastEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(LAST_EMAIL_KEY, secureOptions);
}

export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(APP_LOCK_KEY, enabled ? "true" : "false", secureOptions);
}

export async function getAppLockEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(APP_LOCK_KEY, secureOptions)) === "true";
}

export async function canUseDeviceAuthentication(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled;
}

export async function unlockPrivateSession(): Promise<boolean> {
  const canAuthenticate = await canUseDeviceAuthentication();
  if (!canAuthenticate) {
    return true;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock Flourish",
    cancelLabel: "Not now",
    disableDeviceFallback: false,
  });

  return result.success;
}
