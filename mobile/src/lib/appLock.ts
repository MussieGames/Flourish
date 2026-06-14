import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const APP_LOCK_KEY = 'flourish.appLock.enabled';

/**
 * Optional privacy lock: requires Face ID / Touch ID / device passcode before
 * the app's contents are shown. The preference is stored in the OS keychain /
 * keystore via SecureStore (not AsyncStorage), so it can't be read by other
 * apps or trivially tampered with.
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

export async function deviceSupportsBiometrics(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && enrolled;
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
