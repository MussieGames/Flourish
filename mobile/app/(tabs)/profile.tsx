import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Hero, InfoBox, SectionLabel } from '@/components';
import { useAppLock } from '@/context/AppLockContext';
import { useAuth } from '@/context/AuthContext';
import { computeAge } from '@/lib/age';
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
  const { user, profile, activeBaby, emailVerified, signOutUser, resendVerification } = useAuth();
  const { supported, enabled, setEnabled } = useAppLock();

  const age = computeAge(activeBaby?.birthDate);

  const toggleLock = async (next: boolean) => {
    const ok = await setEnabled(next);
    if (!ok && next) {
      Alert.alert('Couldn’t enable App Lock', 'Biometric authentication was cancelled or unavailable.');
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'You can always sign back in to continue their story.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOutUser() },
    ]);
  };

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <Hero paddingTop={insets.top + 20} glow="rgba(201,169,110,0.16)">
        <AppText variant="label" color={colors.gold}>
          Your account
        </AppText>
        <AppText variant="display" color={colors.cream}>
          {activeBaby?.name ?? 'Profile'}
        </AppText>
        <AppText variant="caption" color={colors.onDark45} style={styles.sub}>
          {age ? age.label : 'Set up in progress'} · {user?.email}
        </AppText>
      </Hero>

      <View style={styles.body}>
        <SectionLabel>Membership</SectionLabel>
        <Row
          icon="leaf-outline"
          label={PLAN_NAMES[profile?.plan ?? 'seedling']}
          sublabel="View plans & upgrade"
          onPress={() => router.push('/plan')}
        />

        <SectionLabel>{activeBaby?.name ?? 'Baby'}&apos;s world</SectionLabel>
        <Row icon="calendar-outline" label="Memory calendar" onPress={() => router.push('/calendar')} />
        <Row icon="journal-outline" label="Journal" onPress={() => router.push('/journal')} sublabel="The things photos can’t capture" />

        <SectionLabel>Privacy &amp; security</SectionLabel>
        <View style={styles.lockRow}>
          <View style={styles.rowIcon}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.sienna} />
          </View>
          <View style={styles.flex1}>
            <AppText variant="bodyMedium">App Lock</AppText>
            <AppText variant="caption">
              {supported ? 'Require Face ID / passcode to open' : 'No biometrics enrolled on this device'}
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
          <AppText variant="caption" color={colors.inkLight} style={styles.promiseText}>
            <AppText style={styles.promiseStrong}>🔒 Our promise: </AppText>
            Your data is private by default. Zero ads. Zero data sharing. Only the family members
            you invite can ever see {activeBaby?.name ?? 'your baby'}&apos;s memories.
          </AppText>
        </InfoBox>

        <Pressable style={styles.signOut} onPress={confirmSignOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <AppText variant="bodyMedium" color={colors.danger}>
            Sign out
          </AppText>
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
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={colors.sienna} />
      </View>
      <View style={styles.flex1}>
        <AppText variant="bodyMedium">{label}</AppText>
        {sublabel ? <AppText variant="caption">{sublabel}</AppText> : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
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
  lockRow: {
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
  promise: { marginTop: 12 },
  promiseText: { lineHeight: 18 },
  promiseStrong: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.sageDark },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
  },
});
