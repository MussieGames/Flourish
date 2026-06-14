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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { signUp, getAuthErrorMessage } from '../../src/services/auth';
import { createBaby } from '../../src/services/firestore';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

const schema = z.object({
  displayName: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { babyName } = useLocalSearchParams<{ babyName?: string }>();

  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSignUp = async () => {
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await signUp(form.email, form.password, form.displayName);
      if (babyName) {
        // Create baby profile automatically from onboarding
        await createBaby(user.uid, {
          name: babyName,
          birthDate: new Date(), // User will update this in profile
        });
      }
      router.replace('/(tabs)/');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      const message = getAuthErrorMessage(code) || (err as Error).message;
      Alert.alert('Sign Up Failed', message);
    } finally {
      setLoading(false);
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
          style={styles.back}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.eyebrow}>
          <View style={styles.eyebrowLine} />
          <Text style={styles.eyebrowText}>CREATE YOUR ACCOUNT</Text>
        </View>

        <Text style={styles.title}>
          Start <Text style={styles.titleItalic}>preserving</Text>
          {'\n'}every moment.
        </Text>

        {babyName ? (
          <View style={styles.babyBadge}>
            <Text style={styles.babyBadgeText}>
              🌿 Creating {babyName}'s story
            </Text>
          </View>
        ) : null}

        <View style={styles.formSection}>
          <Input
            label="Your name"
            placeholder="e.g. Sarah..."
            value={form.displayName}
            onChangeText={(t) => update('displayName', t)}
            error={errors.displayName}
            autoCapitalize="words"
          />
          <Input
            label="Email address"
            placeholder="you@example.com"
            value={form.email}
            onChangeText={(t) => update('email', t)}
            error={errors.email}
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Password"
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
            value={form.password}
            onChangeText={(t) => update('password', t)}
            error={errors.password}
            secureTextEntry={!showPassword}
            hint="We'll never ask for this in an email or message."
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            }
          />
        </View>

        <View style={styles.terms}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text> and{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>. Your data
            is encrypted and never sold.
          </Text>
        </View>

        <Button onPress={handleSignUp} title="Create my account →" loading={loading} />

        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/signin')}>
            <Text style={styles.signinLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingHorizontal: 28 },
  back: { marginBottom: Spacing['3xl'] },
  backText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.lg,
    color: Colors.sienna,
  },
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
    marginBottom: Spacing['2xl'],
  },
  titleItalic: { fontFamily: 'CormorantGaramond_300Light_Italic', color: Colors.sienna },
  babyBadge: {
    backgroundColor: 'rgba(181,196,177,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 2,
    borderLeftColor: Colors.sageDark,
    marginBottom: Spacing['2xl'],
  },
  babyBadgeText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.sageDark,
  },
  formSection: { marginBottom: Spacing.xl },
  terms: { marginBottom: Spacing['2xl'] },
  termsText: {
    fontFamily: 'DMSans_300Light',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
    lineHeight: 18,
  },
  termsLink: { color: Colors.sienna, textDecorationLine: 'underline' },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  signinText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.inkMedium,
  },
  signinLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.sienna,
    textDecorationLine: 'underline',
  },
});
