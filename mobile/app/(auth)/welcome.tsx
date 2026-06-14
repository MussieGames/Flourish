import { Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { checkPassword, isValidEmail } from '@/lib/validation';
import { colors, fonts } from '@/theme';

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];
const STRENGTH_COLORS = [colors.danger, colors.danger, colors.gold, colors.sageDark, colors.sageDark];

export default function Welcome() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [babyName, setBabyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => checkPassword(password), [password]);
  const canSubmit = isValidEmail(email) && strength.ok;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signUp(email, password, babyName);
      // Auth state change + guard will route to /onboarding to finish setup.
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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Hero paddingTop={72} style={styles.hero}>
          <AppText style={styles.moon}>🌿</AppText>
          <AppText variant="display" color={colors.cream}>
            Welcome to{'\n'}
            <AppText variant="displayItalic" color={colors.rose}>
              Flourish.
            </AppText>
          </AppText>
          <AppText variant="bodyLight" color={colors.onDark60} style={styles.heroPara}>
            You just did something extraordinary. And in between the feeds, the tears, the love
            that doesn&apos;t fit into words — we&apos;ll help you catch every moment before it
            slips by.
          </AppText>
        </Hero>

        <View style={styles.form}>
          <AppText variant="label">Let&apos;s begin</AppText>
          <AppText variant="title" style={styles.question}>
            What&apos;s your{'\n'}
            <AppText variant="titleItalic" color={colors.sienna}>
              little one&apos;s
            </AppText>{' '}
            name?
          </AppText>

          <TextField
            icon="🍼"
            serif
            placeholder="e.g. Oliver…"
            value={babyName}
            onChangeText={setBabyName}
            autoCapitalize="words"
            maxLength={40}
            returnKeyType="next"
          />
          <AppText variant="caption" style={styles.hint}>
            You can always change this later. This is just for us to make their story feel like
            theirs.
          </AppText>

          <View style={styles.gap}>
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
          </View>
          <View style={styles.gap}>
            <TextField
              icon="🔒"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
            />
          </View>

          {password.length > 0 ? (
            <View style={styles.strengthRow}>
              <View style={styles.strengthTrack}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${(strength.score / 4) * 100}%`,
                      backgroundColor: STRENGTH_COLORS[strength.score],
                    },
                  ]}
                />
              </View>
              <AppText variant="caption" color={STRENGTH_COLORS[strength.score]}>
                {STRENGTH_LABELS[strength.score]}
              </AppText>
            </View>
          ) : null}

          {error ? (
            <AppText variant="caption" color={colors.danger} style={styles.error}>
              {error}
            </AppText>
          ) : null}

          <View style={styles.button}>
            <Button
              label="Begin their story →"
              loading={submitting}
              disabled={!canSubmit}
              onPress={handleSubmit}
            />
          </View>

          <Link href="/(auth)/sign-in" asChild>
            <Pressable hitSlop={8}>
              <AppText variant="caption" center style={styles.signIn}>
                Already have an account?{' '}
                <AppText variant="caption" color={colors.sienna} style={styles.underline}>
                  Sign in
                </AppText>
              </AppText>
            </Pressable>
          </Link>
        </View>

        <InfoBox accent={colors.sageDark} style={styles.reassure}>
          <AppText variant="caption" color={colors.inkLight} style={styles.reassureText}>
            <AppText variant="bodyMedium" color={colors.sageDark} style={styles.lockText}>
              🔒 This is your private space.{' '}
            </AppText>
            Only people you invite can see your baby&apos;s memories. We never share, sell, or use
            your data. Ever.
          </AppText>
        </InfoBox>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 40 },
  hero: { paddingBottom: 40 },
  moon: { fontSize: 36, marginBottom: 16 },
  heroPara: { marginTop: 12 },
  form: { paddingHorizontal: 24, paddingTop: 28 },
  question: { marginTop: 16, marginBottom: 20 },
  hint: { marginTop: 4, lineHeight: 18 },
  gap: { marginTop: 12 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  strengthTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(196,169,160,0.3)',
    overflow: 'hidden',
  },
  strengthFill: { height: 4, borderRadius: 2 },
  error: { marginTop: 12 },
  button: { marginTop: 24 },
  signIn: { marginTop: 18 },
  underline: { textDecorationLine: 'underline' },
  reassure: { marginHorizontal: 24, marginTop: 28 },
  reassureText: { lineHeight: 18 },
  lockText: { fontFamily: fonts.bodyMedium, fontSize: 12 },
});
