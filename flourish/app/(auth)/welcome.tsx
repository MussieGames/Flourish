/**
 * Welcome / Onboarding — two-step: baby's name then birthday.
 * No account required yet. Low friction, warm, feels like a gift.
 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { WarmHero } from '../../src/components/WarmHero';
import { sanitizeName } from '../../src/utils/sanitize';

// Minimal inline date picker: three linked TextInput fields (DD / MM / YYYY)
// No external dependency — fully platform-agnostic.
function DateInput({
  value,
  onChange,
  error,
}: {
  value: { day: string; month: string; year: string };
  onChange: (v: { day: string; month: string; year: string }) => void;
  error?: string;
}) {
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  return (
    <View>
      <View style={dateStyles.row}>
        {/* Day */}
        <View style={[dateStyles.field, dateStyles.fieldSmall, error ? dateStyles.fieldError : null]}>
          <TextInput
            style={dateStyles.input}
            placeholder="DD"
            placeholderTextColor={Colors.inkMedium}
            keyboardType="number-pad"
            maxLength={2}
            value={value.day}
            onChangeText={(t) => {
              const digits = t.replace(/\D/g, '');
              onChange({ ...value, day: digits });
              if (digits.length === 2) monthRef.current?.focus();
            }}
            returnKeyType="next"
            onSubmitEditing={() => monthRef.current?.focus()}
          />
        </View>
        <Text style={dateStyles.sep}>/</Text>
        {/* Month */}
        <View style={[dateStyles.field, dateStyles.fieldSmall, error ? dateStyles.fieldError : null]}>
          <TextInput
            ref={monthRef}
            style={dateStyles.input}
            placeholder="MM"
            placeholderTextColor={Colors.inkMedium}
            keyboardType="number-pad"
            maxLength={2}
            value={value.month}
            onChangeText={(t) => {
              const digits = t.replace(/\D/g, '');
              onChange({ ...value, month: digits });
              if (digits.length === 2) yearRef.current?.focus();
            }}
            returnKeyType="next"
            onSubmitEditing={() => yearRef.current?.focus()}
          />
        </View>
        <Text style={dateStyles.sep}>/</Text>
        {/* Year */}
        <View style={[dateStyles.field, dateStyles.fieldLarge, error ? dateStyles.fieldError : null]}>
          <TextInput
            ref={yearRef}
            style={dateStyles.input}
            placeholder="YYYY"
            placeholderTextColor={Colors.inkMedium}
            keyboardType="number-pad"
            maxLength={4}
            value={value.year}
            onChangeText={(t) => onChange({ ...value, year: t.replace(/\D/g, '') })}
            returnKeyType="done"
          />
        </View>
      </View>
      {error ? <Text style={dateStyles.error}>{error}</Text> : null}
    </View>
  );
}

const dateStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: {
    backgroundColor: Colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.35)',
    borderRadius: BorderRadius.sm,
  },
  fieldSmall: { width: 64 },
  fieldLarge: { flex: 1 },
  fieldError: { borderColor: '#e57373' },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
  },
  sep: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 24,
    color: Colors.inkMedium,
  },
  error: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: '#e57373',
    marginTop: Spacing.xs,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

function parseDateFields(day: string, month: string, year: string): Date | null {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  if (d < 1 || d > 31 || m < 1 || m > 12) return null;
  if (year.length !== 4 || y < 2000 || y > new Date().getFullYear()) return null;
  const date = new Date(y, m - 1, d);
  if (date > new Date()) return null; // can't be born in the future
  return date;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Step 1: name. Step 2: birthday.
  const [step, setStep] = useState<1 | 2>(1);
  const [babyName, setBabyName] = useState('');
  const [nameError, setNameError] = useState('');
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [dateError, setDateError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const handleNameNext = () => {
    const cleaned = sanitizeName(babyName);
    if (!cleaned) {
      setNameError("We'd love to know their name 🌿");
      return;
    }
    setBabyName(cleaned);
    setStep(2);
  };

  const handleBegin = () => {
    const parsed = parseDateFields(birthDate.day, birthDate.month, birthDate.year);
    if (!parsed) {
      setDateError("Please enter a valid birthday (DD / MM / YYYY).");
      return;
    }
    router.push({
      pathname: '/(auth)/signup',
      params: {
        babyName,
        birthDateISO: parsed.toISOString(),
      },
    });
  };

  const handleSkip = () => {
    router.push('/(auth)/signup');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Rich gradient hero */}
        <WarmHero style={[styles.hero, { paddingTop: insets.top + 36 }]}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.moonEmoji}>🌿</Text>
            <Text style={styles.heroTitle}>
              Welcome to{'\n'}
              <Text style={styles.heroTitleItalic}>Flourish.</Text>
            </Text>
            <Text style={styles.heroPara}>
              You just did something extraordinary. And in between the feeds,
              the tears, the love that doesn't fit into words — we'll help you
              catch every moment before it slips by.
            </Text>
          </Animated.View>
        </WarmHero>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
        </View>

        <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
          {step === 1 ? (
            <>
              <View style={styles.eyebrow}>
                <View style={styles.eyebrowLine} />
                <Text style={styles.eyebrowText}>STEP 1 OF 2</Text>
              </View>

              <Text style={styles.question}>
                What's your{'\n'}
                <Text style={styles.questionItalic}>little one's</Text> name?
              </Text>

              <View style={[styles.inputWrap, nameError ? styles.inputError : null]}>
                <Text style={styles.inputIcon}>🌿</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Oliver..."
                  placeholderTextColor={Colors.inkMedium}
                  value={babyName}
                  onChangeText={(t) => {
                    setBabyName(t);
                    if (nameError) setNameError('');
                  }}
                  maxLength={50}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={handleNameNext}
                />
              </View>

              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : (
                <Text style={styles.hint}>
                  You can always change this later — this just makes their
                  story feel like theirs.
                </Text>
              )}

              <Button onPress={handleNameNext} title="Next →" style={styles.ctaBtn} />
            </>
          ) : (
            <>
              <View style={styles.eyebrow}>
                <View style={styles.eyebrowLine} />
                <Text style={styles.eyebrowText}>STEP 2 OF 2</Text>
              </View>

              <Text style={styles.question}>
                When was{' '}
                <Text style={styles.questionItalic}>{babyName}</Text>
                {'\n'}born?
              </Text>

              <DateInput
                value={birthDate}
                onChange={(v) => {
                  setBirthDate(v);
                  if (dateError) setDateError('');
                }}
                error={dateError}
              />

              <Text style={[styles.hint, { marginTop: Spacing.md }]}>
                We use this to track milestones at the right time and remind
                you what's coming.
              </Text>

              <Button onPress={handleBegin} title="Begin their story →" style={styles.ctaBtn} />

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.backBtn}
              >
                <Text style={styles.backText}>‹ Back</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>I'll add this later</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Privacy reassurance */}
        <View style={styles.reassure}>
          <Text style={styles.reassureText}>
            <Text style={styles.reassureStrong}>🔒 This is your private space.</Text>{' '}
            Only people you invite can see your baby's memories. We never
            share, sell, or use your data. Ever.
          </Text>
        </View>

        {/* Sign in link */}
        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signin')}>
            <Text style={styles.signinLink}>Sign in</Text>
          </TouchableOpacity>
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
  moonEmoji: { fontSize: 36, marginBottom: 16 },
  heroTitle: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 36,
    color: Colors.cream,
    lineHeight: 42,
    marginBottom: 12,
  },
  heroTitleItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.rose,
  },
  heroPara: {
    fontFamily: 'DMSans_300Light',
    fontSize: Typography.sizes.md,
    color: 'rgba(251,247,242,0.65)',
    lineHeight: 24,
  },

  stepRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 4,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(196,169,160,0.35)',
  },
  stepDotActive: { backgroundColor: Colors.sienna },

  form: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.xl },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  eyebrowLine: { width: 16, height: 1, backgroundColor: Colors.sienna },
  eyebrowText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    letterSpacing: 1.8,
    color: Colors.sienna,
  },

  question: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 26,
    color: Colors.ink,
    lineHeight: 32,
    marginBottom: Spacing['2xl'],
  },
  questionItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.sienna,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.35)',
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  inputError: { borderColor: '#e57373' },
  inputIcon: { paddingHorizontal: 16, fontSize: 18 },
  input: {
    flex: 1,
    paddingVertical: 18,
    paddingRight: 20,
    fontFamily: 'CormorantGaramond_300Light_Italic',
    fontSize: 22,
    color: Colors.ink,
  },

  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: '#e57373',
    marginBottom: Spacing.xl,
  },
  hint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
    lineHeight: 18,
    marginBottom: Spacing['2xl'],
  },

  ctaBtn: { marginBottom: Spacing.md },
  backBtn: { marginBottom: Spacing.sm },
  backText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.md,
    color: Colors.sienna,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
    textDecorationLine: 'underline',
  },

  reassure: {
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.mdPlus,
    paddingLeft: 18,
    backgroundColor: 'rgba(181,196,177,0.15)',
    borderLeftWidth: 2,
    borderLeftColor: Colors.sageDark,
  },
  reassureText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkLight,
    lineHeight: 20,
  },
  reassureStrong: {
    fontFamily: 'DMSans_500Medium',
    color: Colors.sageDark,
  },

  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
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
