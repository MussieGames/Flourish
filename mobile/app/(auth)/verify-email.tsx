import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Hero, InfoBox } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { colors, radius } from '@/theme';

export default function VerifyEmail() {
  const insets = useSafeAreaInsets();
  const { user, reloadUser, resendVerification, signOutUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);

  const checkVerification = async () => {
    setChecking(true);
    try {
      const verified = await reloadUser();
      if (!verified) {
        Alert.alert('Still waiting', 'Open the verification link we sent, then tap Check again.');
      }
    } catch {
      Alert.alert('Couldn’t check', 'Please try again in a moment.');
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    setSending(true);
    try {
      await resendVerification();
      Alert.alert('Verification sent', 'Check your inbox for a fresh verification link.');
    } catch {
      Alert.alert('Couldn’t send', 'Please try again in a moment.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <Hero paddingTop={insets.top + 48} style={styles.hero}>
        <AppText style={styles.icon}>✉️</AppText>
        <AppText variant="display" color={colors.cream}>
          Verify your{'\n'}
          <AppText variant="displayItalic" color={colors.rose}>
            email.
          </AppText>
        </AppText>
        <AppText variant="bodyLight" color={colors.onDark60} style={styles.heroPara}>
          We need to confirm this address before creating private family data.
        </AppText>
      </Hero>

      <View style={styles.body}>
        <InfoBox accent={colors.sageDark}>
          <AppText variant="body" color={colors.inkLight} style={styles.message}>
            We sent a verification link to{' '}
            <AppText variant="bodyMedium" color={colors.inkLight}>
              {user?.email ?? 'your email address'}
            </AppText>
            . Open it, then come back to Flourish.
          </AppText>
        </InfoBox>

        <View style={styles.actions}>
          <Button label="Check verification" loading={checking} onPress={checkVerification} />
          <Button label="Resend email" variant="outline" loading={sending} onPress={resend} />
        </View>

        <Pressable style={styles.signOut} onPress={() => signOutUser()}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <AppText variant="bodyMedium" color={colors.danger}>
            Use a different email
          </AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  hero: { paddingBottom: 44 },
  icon: { fontSize: 36, marginBottom: 16 },
  heroPara: { marginTop: 12 },
  body: { padding: 24 },
  message: { lineHeight: 22 },
  actions: { gap: 10, marginTop: 24 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: radius.sm,
  },
});
