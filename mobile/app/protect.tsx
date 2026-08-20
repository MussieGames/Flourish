import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BrandMark, Button, Icon, InfoBox } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useAppLock } from '@/context/AppLockContext';
import { colors, radius } from '@/theme';

export default function ProtectOptIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby } = useAuth();
  const { biometricLabel, setEnabled, skipPrompt, supported } = useAppLock();
  const [saving, setSaving] = useState(false);
  const name = activeBaby?.name ?? 'your baby';

  const finish = () => router.replace('/(tabs)');

  const onEnable = async () => {
    setSaving(true);
    try {
      const ok = await setEnabled(true);
      if (ok) finish();
    } finally {
      setSaving(false);
    }
  };

  const onSkip = async () => {
    await skipPrompt();
    finish();
  };

  const lockName = biometricLabel === 'fingerprint' ? 'your fingerprint' : biometricLabel;

  return (
    <View style={[styles.flex, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <LinearGradient
        colors={['rgba(193,123,92,0.16)', 'transparent']}
        start={{ x: 0.8, y: 1 }}
        end={{ x: 0.2, y: 0 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.hero}>
        <BrandMark size={28} color={colors.sage} bloom />
        <AppText variant="label" color={colors.gold} style={styles.eyebrow}>
          Keep it private
        </AppText>
        <AppText variant="display" color={colors.cream}>
          Lock {name}&apos;s story{'\n'}
          <AppText variant="displayItalic" color={colors.rose}>behind {lockName}.</AppText>
        </AppText>
        <AppText variant="bodyLight" color={colors.onDark60} style={styles.lede}>
          If someone picks up your phone, they shouldn&apos;t see {name}&apos;s memories.
          We&apos;ll also ask again before a password reset or a sharing invite.
        </AppText>
      </View>

      <View style={styles.points}>
        <Point icon="lock-closed-outline" title={`Open with ${lockName}`}>
          A quiet lock when you come back to Flourish — not a second login.
        </Point>
        <Point icon="mail-outline" title="Reset still goes to your email">
          {`Forgot password sends a link to your inbox. ${lockName} still protects the copy on this phone.`}
        </Point>
        <Point icon="close-circle-outline" title="Off whenever you like">
          One toggle in Profile. You can turn it on later.
        </Point>
      </View>

      {!supported ? (
        <InfoBox accent={colors.sageDark} tint="rgba(181,196,177,0.12)" style={styles.note}>
          <AppText variant="caption" color={colors.onDark45}>
            This device doesn&apos;t have Face ID or a fingerprint enrolled. You can still reset your
            password by email.
          </AppText>
        </InfoBox>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={supported ? `Turn on ${biometricLabel}` : 'Continue'}
          loading={saving}
          onPress={supported ? onEnable : onSkip}
        />
        {supported ? (
          <Pressable onPress={onSkip} style={styles.skip}>
            <AppText variant="label" color={colors.onDark45}>Not now</AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Point({
  icon,
  title,
  children,
}: {
  icon: 'lock-closed-outline' | 'mail-outline' | 'close-circle-outline';
  title: string;
  children: string;
}) {
  return (
    <View style={styles.point}>
      <View style={styles.pointIcon}>
        <Icon name={icon} size={16} color={colors.sienna} />
      </View>
      <View style={styles.flex1}>
        <AppText variant="bodyMedium" color={colors.cream}>{title}</AppText>
        <AppText variant="caption" color={colors.onDark45} style={styles.pointBody}>{children}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ink, paddingHorizontal: 24 },
  flex1: { flex: 1 },
  hero: { paddingTop: 12 },
  eyebrow: { marginTop: 18, marginBottom: 10 },
  lede: { marginTop: 12, lineHeight: 22 },
  points: { marginTop: 28, gap: 14 },
  point: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pointIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(193,123,92,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pointBody: { marginTop: 3, lineHeight: 18 },
  note: { marginTop: 24 },
  actions: { marginTop: 'auto', paddingTop: 20, gap: 4 },
  skip: { alignItems: 'center', paddingVertical: 14 },
});
