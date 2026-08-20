import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { AppText } from './Text';
import { Button } from './Button';
import { BrandMark } from './BrandMark';

export function LockScreen({ onUnlock }: { onUnlock: () => Promise<boolean> }) {
  useEffect(() => {
    // Prompt automatically the moment the lock screen appears.
    onUnlock().catch(() => {});
  }, [onUnlock]);

  return (
    <View style={styles.wrap}>
      <BrandMark size={40} color={colors.sage} />
      <View style={styles.emoji} />
      <AppText variant="display" color={colors.cream} center>
        Flourish
      </AppText>
      <AppText variant="caption" color={colors.onDark45} center style={styles.sub}>
        Your memories are locked. Unlock with Face ID, fingerprint, or your device passcode.
      </AppText>
      <View style={styles.button}>
        <Button label="Unlock" onPress={() => onUnlock()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: { height: 12 },
  sub: { marginTop: 12, maxWidth: 240 },
  button: { marginTop: 32, alignSelf: 'stretch' },
});
