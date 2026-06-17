import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signIn, resetPassword, getAuthErrorMessage } from '../../src/services/auth';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { WarmHero } from '../../src/components/WarmHero';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      Alert.alert('Sign In Failed', code ? getAuthErrorMessage(code) : (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Please enter your email address first.');
      return;
    }
    try {
      await resetPassword(email.trim().toLowerCase());
      Alert.alert('Check your email', "We've sent a password reset link to your inbox.");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      Alert.alert('Error', getAuthErrorMessage(code));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Rich warm hero — matches Welcome screen language */}
        <WarmHero style={[styles.hero, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.moonEmoji}>🌿</Text>
          <Text style={styles.heroTitle}>
            Sign back into{'\n'}
            <Text style={styles.heroTitleItalic}>your story.</Text>
          </Text>
          <Text style={styles.heroPara}>
            Their memories are right where you left them.
          </Text>
        </WarmHero>

        <View style={styles.form}>
          <Input
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            }
          />

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>

          <Button onPress={handleSignIn} title="Sign in →" loading={loading} />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New to Flourish? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/welcome')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },

  hero: {
    paddingHorizontal: 28,
    paddingBottom: 44,
  },
  backText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.lg,
    color: 'rgba(251,247,242,0.7)',
    marginBottom: Spacing['2xl'],
  },
  moonEmoji: { fontSize: 32, marginBottom: Spacing.xl },
  heroTitle: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 36,
    color: Colors.cream,
    lineHeight: 42,
    marginBottom: 8,
  },
  heroTitleItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.rose,
  },
  heroPara: {
    fontFamily: 'DMSans_300Light',
    fontSize: Typography.sizes.sm,
    color: 'rgba(251,247,242,0.5)',
  },

  form: { padding: Spacing['2xl'] },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing['2xl'], marginTop: -Spacing.sm },
  forgotText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.sienna,
    textDecorationLine: 'underline',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  signupText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.inkMedium,
  },
  signupLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.sienna,
    textDecorationLine: 'underline',
  },
});
