import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AppText, Button, Hero, TextField } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { friendlyAuthError } from '@/lib/errors';
import { colors } from '@/theme';

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
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
        <Hero paddingTop={80} style={styles.hero}>
          <AppText style={styles.moon}>🌙</AppText>
          <AppText variant="display" color={colors.cream}>
            Welcome{'\n'}
            <AppText variant="displayItalic" color={colors.rose}>
              back.
            </AppText>
          </AppText>
          <AppText variant="bodyLight" color={colors.onDark60} style={styles.heroPara}>
            Their story is right where you left it.
          </AppText>
        </Hero>

        <View style={styles.form}>
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
          <View style={styles.gap}>
            <TextField
              icon="🔒"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
            />
          </View>

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable hitSlop={8} style={styles.forgot}>
              <AppText variant="caption" color={colors.sienna}>
                Forgot password?
              </AppText>
            </Pressable>
          </Link>

          {error ? (
            <AppText variant="caption" color={colors.danger} style={styles.error}>
              {error}
            </AppText>
          ) : null}

          <View style={styles.button}>
            <Button label="Sign in" loading={submitting} onPress={handleSubmit} />
          </View>

          <Link href="/(auth)/welcome" asChild>
            <Pressable hitSlop={8}>
              <AppText variant="caption" center style={styles.create}>
                New here?{' '}
                <AppText variant="caption" color={colors.sienna} style={styles.underline}>
                  Create an account
                </AppText>
              </AppText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 40 },
  hero: { paddingBottom: 44 },
  moon: { fontSize: 36, marginBottom: 16 },
  heroPara: { marginTop: 12 },
  form: { paddingHorizontal: 24, paddingTop: 32 },
  gap: { marginTop: 12 },
  forgot: { alignSelf: 'flex-end', marginTop: 12 },
  error: { marginTop: 12 },
  button: { marginTop: 24 },
  create: { marginTop: 20 },
  underline: { textDecorationLine: 'underline' },
});
