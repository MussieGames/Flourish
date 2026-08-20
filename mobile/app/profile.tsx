import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BrandMark, Button, Icon, InfoBox, SectionLabel, TextField } from '@/components';
import type { IconName } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useAppLock } from '@/context/AppLockContext';
import { useReminders } from '@/context/RemindersContext';
import { useMemories } from '@/hooks/useBabyData';
import { computeAge } from '@/lib/age';
import { friendlyAuthError } from '@/lib/errors';
import {
  finishTotpEnrollment,
  startTotpEnrollment,
  totpEnrollment,
  unenrollTotp,
  type TotpSecret,
} from '@/lib/mfa';
import { hasSharingAccess, seedlingUsage } from '@/lib/plans';
import { colors, fonts, radius } from '@/theme';
import type { PlanId } from '@/types/models';

const PLAN_NAMES: Record<PlanId, string> = {
  seedling: 'Seedling (Free)',
  bloom: 'Bloom',
  heirloom: 'Heirloom',
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, activeBaby, emailVerified, isOwner, signOutUser, resendVerification, resetPassword } = useAuth();
  const { supported, enabled, setEnabled, confirmIdentity, biometricLabel } = useAppLock();
  const {
    enabled: remindersOn,
    permission,
    enableReminders,
    disableReminders,
  } = useReminders();
  const { items: memories } = useMemories(activeBaby?.id);

  const age = computeAge(activeBaby?.birthDate);
  const name = activeBaby?.name ?? 'your baby';
  const plan = profile?.plan ?? 'seedling';
  const sharingOn = hasSharingAccess(plan);
  const photos = memories.filter((m) => m.kind === 'photo').length;
  const videos = memories.filter((m) => m.kind === 'video').length;
  const usage = seedlingUsage(photos, videos);
  const lockName = biometricLabel === 'fingerprint' ? 'your fingerprint' : biometricLabel;
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const [totpOn, setTotpOn] = useState(() => totpEnrollment(user).enrolled);

  const toggleLock = async (next: boolean) => {
    const ok = await setEnabled(next);
    if (!ok && next) {
      Alert.alert('Couldn’t enable App Lock', `${lockName} was cancelled or unavailable.`);
    }
  };

  const sendReset = async () => {
    const email = user?.email;
    if (!email) return;
    const ok = await confirmIdentity(`Confirm it’s you to reset your password`);
    if (!ok) return;
    try {
      await resetPassword(email);
      Alert.alert(
        'Reset link sent',
        `If an account exists for ${email}, a link is on its way. App Lock still protects the copy of memories on this device.`,
      );
    } catch {
      Alert.alert('Hmm', 'Couldn’t send a reset email right now. Try again shortly.');
    }
  };

  const startAuthenticator = async () => {
    if (!user) return;
    const ok = await confirmIdentity('Confirm it’s you to turn on an authenticator app');
    if (!ok) return;
    setMfaBusy(true);
    try {
      const secret = await startTotpEnrollment(user);
      setTotpSecret(secret);
      setTotpCode('');
    } catch (err) {
      Alert.alert(
        'Couldn’t start authenticator',
        (err as { code?: string }).code === 'auth/requires-recent-login'
          ? 'For safety, please sign out and sign back in, then try again.'
          : friendlyAuthError(err),
      );
    } finally {
      setMfaBusy(false);
    }
  };

  const confirmAuthenticator = async () => {
    if (!user || !totpSecret || totpCode.length !== 6) return;
    setMfaBusy(true);
    try {
      await finishTotpEnrollment(user, totpSecret, totpCode);
      setTotpSecret(null);
      setTotpCode('');
      setTotpOn(true);
      Alert.alert(
        'Authenticator on',
        'You’ll need a code from your authenticator app the next time you sign in. Flourish never uses text messages.',
      );
    } catch (err) {
      Alert.alert('That code didn’t work', friendlyAuthError(err));
    } finally {
      setMfaBusy(false);
    }
  };

  const removeAuthenticator = () => {
    if (!user) return;
    Alert.alert(
      'Turn off authenticator?',
      'You’ll be able to sign in with just your password again.',
      [
        { text: 'Keep it on', style: 'cancel' },
        {
          text: 'Turn off',
          style: 'destructive',
          onPress: async () => {
            const ok = await confirmIdentity('Confirm it’s you to turn off your authenticator');
            if (!ok) return;
            setMfaBusy(true);
            try {
              await unenrollTotp(user);
              setTotpOn(false);
              Alert.alert('Authenticator off', 'Your account now signs in with email and password only.');
            } catch (err) {
              Alert.alert(
                'Couldn’t turn it off',
                (err as { code?: string }).code === 'auth/requires-recent-login'
                  ? 'For safety, please sign out and sign back in, then try again.'
                  : friendlyAuthError(err),
              );
            } finally {
              setMfaBusy(false);
            }
          },
        },
      ],
    );
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'You can always sign back in to continue their story.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOutUser() },
    ]);
  };

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron-back" size={26} color={colors.cream} />
        </Pressable>
        <AppText variant="label" color={colors.gold}>Your account</AppText>
        <AppText variant="display" color={colors.cream}>{activeBaby?.name ?? 'Profile'}</AppText>
        <AppText variant="caption" color={colors.onDark45} style={styles.sub}>
          {age ? age.label : 'Set up in progress'} · {user?.email}
        </AppText>
      </View>

      <View style={styles.body}>
        <SectionLabel>Membership</SectionLabel>
        <Row
          icon="leaf-outline"
          label={PLAN_NAMES[plan]}
          sublabel="View plans & upgrade"
          onPress={() => router.push('/plan')}
        />
        {plan === 'seedling' && usage.showMeter ? (
          <Pressable style={styles.meter} onPress={() => router.push('/plan')}>
            <AppText variant="bodyMedium">Photo storage</AppText>
            <AppText variant="caption" style={styles.meterSub}>
              {usage.photos} of {usage.photoLimit} photos · {usage.videos} of {usage.videoLimit} videos
            </AppText>
            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${Math.min(100, Math.max(usage.photoPct, usage.videoPct) * 100)}%` },
                ]}
              />
            </View>
            <AppText variant="caption" color={colors.sienna} style={styles.meterHint}>
              Bloom is unlimited, if you want to keep capturing.
            </AppText>
          </Pressable>
        ) : null}

        <SectionLabel>{name}&apos;s world</SectionLabel>
        <Row
          icon="people-outline"
          label="Family & sharing"
          sublabel={sharingOn ? 'Choose who can see their story' : 'Private sharing on Bloom'}
          onPress={() => router.push('/sharing')}
        />
        <Row icon="calendar-outline" label="Memory calendar" onPress={() => router.push('/calendar')} />
        {isOwner ? (
          <Row
            icon="create-outline"
            label="Journal"
            sublabel="The things photos can’t capture · private to you"
            onPress={() => router.push('/(tabs)/journal')}
          />
        ) : null}

        <SectionLabel>Privacy &amp; security</SectionLabel>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Icon name="lock-closed-outline" size={20} color={colors.sienna} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyMedium">App Lock</AppText>
            <AppText variant="caption">
              {supported
                ? `Require ${lockName} to open Flourish`
                : 'No Face ID or fingerprint enrolled on this device'}
            </AppText>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggleLock}
            disabled={!supported}
            trackColor={{ true: colors.sienna, false: colors.border }}
            thumbColor={colors.warm}
          />
        </View>
        <Row
          icon="key-outline"
          label="Reset password"
          sublabel={`We’ll confirm with ${lockName}, then email a link`}
          onPress={sendReset}
        />
        {totpOn && !totpSecret ? (
          <Row
            icon="shield-checkmark-outline"
            label="Authenticator on"
            sublabel="Tap to turn off · no texts"
            onPress={removeAuthenticator}
          />
        ) : totpSecret ? (
          <View style={styles.totpCard}>
            <AppText variant="bodyMedium">Add this key to your authenticator app</AppText>
            <AppText selectable variant="caption" color={colors.ink} style={styles.totpSecret}>
              {totpSecret.secretKey}
            </AppText>
            <AppText variant="caption" style={styles.totpHelp}>
              Google Authenticator, 1Password, or Authy. Then enter the 6-digit code. Flourish never sends codes by text.
            </AppText>
            <View style={styles.totpField}>
              <TextField
                icon="key-outline"
                placeholder="000000"
                value={totpCode}
                onChangeText={(value) => setTotpCode(value.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
              />
            </View>
            <Button
              label={mfaBusy ? 'Checking…' : 'Turn on authenticator'}
              loading={mfaBusy}
              disabled={mfaBusy || totpCode.length !== 6}
              onPress={() => void confirmAuthenticator()}
            />
            <Pressable onPress={() => { setTotpSecret(null); setTotpCode(''); }} style={styles.totpCancel}>
              <AppText variant="caption" color={colors.inkMuted} center>
                Cancel
              </AppText>
            </Pressable>
          </View>
        ) : (
          <Row
            icon="shield-outline"
            label="Authenticator app"
            sublabel="Off · a code at sign-in, never SMS"
            onPress={() => void startAuthenticator()}
          />
        )}
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Icon name="notifications-outline" size={20} color={colors.sienna} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyMedium">Milestone reminders</AppText>
            <AppText variant="caption">
              {permission === 'denied'
                ? 'Notifications are off in system settings'
                : 'A quiet 10am heads-up when a first is likely near'}
            </AppText>
          </View>
          <Switch
            value={remindersOn}
            onValueChange={(next) => {
              if (next) {
                enableReminders().then((ok) => {
                  if (!ok) {
                    Alert.alert(
                      'Couldn’t enable reminders',
                      'Allow notifications for Flourish in your device settings, then try again.',
                    );
                  }
                });
              } else {
                disableReminders();
              }
            }}
            trackColor={{ true: colors.sienna, false: colors.border }}
            thumbColor={colors.warm}
          />
        </View>

        {!emailVerified ? (
          <Row
            icon="mail-unread-outline"
            label="Verify your email"
            sublabel="Tap to resend the verification link"
            onPress={() =>
              resendVerification()
                .then(() => Alert.alert('Sent', 'Check your inbox for the verification link.'))
                .catch(() => Alert.alert('Hmm', 'Couldn’t send right now. Try again shortly.'))
            }
          />
        ) : (
          <Row icon="shield-checkmark-outline" label="Email verified" sublabel={user?.email ?? ''} />
        )}

        <InfoBox accent={colors.sageDark} style={styles.promise}>
          <View style={styles.promiseRow}>
            <BrandMark size={16} color={colors.sageDark} />
            <AppText variant="caption" color={colors.inkLight} style={styles.promiseText}>
              <AppText style={styles.promiseStrong}>Our promise: </AppText>
              Your data is private by default. Zero ads. Zero data sharing. Only the family members
              you invite can ever see {name}&apos;s memories.
            </AppText>
          </View>
        </InfoBox>

        <Pressable style={styles.signOut} onPress={confirmSignOut}>
          <Icon name="log-out-outline" size={18} color={colors.danger} />
          <AppText variant="bodyMedium" color={colors.danger}>Sign out</AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  sublabel,
  onPress,
}: {
  icon: IconName;
  label: string;
  sublabel?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={20} color={colors.sienna} />
      </View>
      <View style={styles.flex1}>
        <AppText variant="bodyMedium">{label}</AppText>
        {sublabel ? <AppText variant="caption">{sublabel}</AppText> : null}
      </View>
      {onPress ? <Icon name="chevron-forward" size={18} color={colors.inkMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  hero: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingBottom: 24 },
  back: { marginBottom: 8 },
  sub: { marginTop: 6 },
  body: { padding: 20, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 10,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(193,123,92,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  meter: {
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: 'rgba(193,123,92,0.35)',
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 10,
  },
  meterSub: { marginTop: 4 },
  meterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: 10,
  },
  meterFill: { height: 6, borderRadius: 3, backgroundColor: colors.sienna },
  meterHint: { marginTop: 8 },
  totpCard: {
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 10,
  },
  totpSecret: {
    marginTop: 10,
    fontFamily: fonts.bodyMedium,
    letterSpacing: 1.2,
    lineHeight: 20,
  },
  totpHelp: { marginTop: 8, lineHeight: 18 },
  totpField: { marginTop: 12, marginBottom: 12 },
  totpCancel: { marginTop: 10, paddingVertical: 6 },
  promise: { marginTop: 12 },
  promiseRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  promiseText: { flex: 1, lineHeight: 18 },
  promiseStrong: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.sageDark },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 14 },
});
