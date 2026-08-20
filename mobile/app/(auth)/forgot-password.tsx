import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AppText, Button, Hero, InfoBox, TextField } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { friendlyAuthError } from '@/lib/errors';
import { colors } from '@/theme';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(email);
      // Always show success — never reveal whether the email exists.
      setSent(true);
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Hero paddingTop={80} style={styles.hero}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <AppText style={styles.back}>‹</AppText>
          </Pressable>
          <AppText variant="display" color={colors.cream}>
            Reset{'\n'}
            <AppText variant="displayItalic" color={colors.rose}>
              password.
            </AppText>
          </AppText>
        </Hero>

        <View style={styles.form}>
          {sent ? (
            <InfoBox accent={colors.sageDark}>
              <AppText variant="body" color={colors.inkLight}>
                If an account exists for that email, a reset link is on its way. Check your inbox
                (and spam folder).
              </AppText>
            </InfoBox>
          ) : (
            <>
              <AppText variant="body" style={styles.intro}>
                Enter your email and we&apos;ll send you a secure link to set a new password.
              </AppText>
              <TextField
                icon="✉️"
                placeholder="Your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
              />
              {error ? (
                <AppText variant="caption" color={colors.danger} style={styles.error}>
                  {error}
                </AppText>
              ) : null}
              <View style={styles.button}>
                <Button label="Send reset link" loading={submitting} onPress={handleSubmit} />
              </View>
            </>
          )}
          <Pressable onPress={() => router.replace('/(auth)/sign-in')} hitSlop={8}>
            <AppText variant="caption" color={colors.sienna} center style={styles.backToSignIn}>
              Back to sign in
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  hero: { paddingBottom: 44 },
  back: { fontSize: 30, color: colors.cream, marginBottom: 8 },
  form: { paddingHorizontal: 24, paddingTop: 28 },
  intro: { marginBottom: 20 },
  error: { marginTop: 12 },
  button: { marginTop: 20 },
  backToSignIn: { marginTop: 24 },
});
