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
      // Custom rate limit error comes as plain Error
      const message = code
        ? getAuthErrorMessage(code)
        : (err as Error).message;
      Alert.alert('Sign In Failed', message);
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
      Alert.alert(
        'Check your email',
        "We've sent a password reset link to your inbox.",
        [{ text: 'OK' }]
      );
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
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.moonEmoji}>🌿</Text>

        <View style={styles.eyebrow}>
          <View style={styles.eyebrowLine} />
          <Text style={styles.eyebrowText}>WELCOME BACK</Text>
        </View>

        <Text style={styles.title}>
          Sign back{'\n'}
          <Text style={styles.titleItalic}>into your story.</Text>
        </Text>

        <View style={styles.formSection}>
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
        </View>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingHorizontal: 28 },
  backText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.lg,
    color: Colors.sienna,
    marginBottom: Spacing['3xl'],
  },
  moonEmoji: { fontSize: 36, marginBottom: Spacing.xl },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  eyebrowLine: { width: 16, height: 1, backgroundColor: Colors.sienna },
  eyebrowText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    letterSpacing: 1.8,
    color: Colors.sienna,
  },
  title: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 36,
    color: Colors.ink,
    lineHeight: 42,
    marginBottom: Spacing['4xl'],
  },
  titleItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.sienna,
  },
  formSection: { marginBottom: Spacing.sm },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing['2xl'] },
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
