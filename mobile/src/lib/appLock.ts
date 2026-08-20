import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const APP_LOCK_KEY = 'flourish.appLock.enabled';
const APP_LOCK_PROMPTED_KEY = 'flourish.appLock.prompted';

export type BiometricLabel = 'Face ID' | 'Touch ID' | 'fingerprint' | 'device passcode';

/**
 * Privacy lock: Face ID / fingerprint / device passcode before the app's
 * contents are shown. Preference lives in the OS keychain / keystore via
 * SecureStore (not AsyncStorage), so it can't be read by other apps.
 */
export async function isAppLockEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return (await SecureStore.getItemAsync(APP_LOCK_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(APP_LOCK_KEY, enabled ? '1' : '0', {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function isAppLockPrompted(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  try {
    return (await SecureStore.getItemAsync(APP_LOCK_PROMPTED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markAppLockPrompted(): Promise<void> {
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(APP_LOCK_PROMPTED_KEY, '1', {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function deviceSupportsBiometrics(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && enrolled;
}

export async function biometricLabel(): Promise<BiometricLabel> {
  if (Platform.OS === 'web') return 'device passcode';
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? 'Touch ID' : 'fingerprint';
    }
  } catch {
    /* fall through */
  }
  return 'device passcode';
}

/** Prompt for biometric / passcode authentication. Returns true on success. */
export async function authenticate(reason = 'Unlock Flourish'): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    fallbackLabel: 'Use passcode',
    disableDeviceFallback: false,
  });
  return result.success;
}

/**
 * Confirm it's the phone's owner before a sensitive action (password reset,
 * sharing invite). Uses Face ID / fingerprint when enrolled; otherwise the
 * device passcode. If the device can't prompt at all, returns true so we
 * don't trap the user — the email reset still goes to their inbox.
 */
export async function confirmIdentity(reason: string): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return true;
    return authenticate(reason);
  } catch {
    return false;
  }
}
