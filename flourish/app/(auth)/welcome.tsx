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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { sanitizeName } from '../../src/utils/sanitize';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [babyName, setBabyName] = useState('');
  const [nameError, setNameError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBegin = () => {
    const cleaned = sanitizeName(babyName);
    if (!cleaned) {
      setNameError("We'd love to know their name 🌿");
      return;
    }
    if (cleaned.length < 1) {
      setNameError('Please enter at least one character.');
      return;
    }
    router.push({
      pathname: '/(auth)/signup',
      params: { babyName: cleaned },
    });
  };

  const handleSkip = () => {
    router.push('/(auth)/signup');
  };

  const handleSignIn = () => {
    router.push('/(auth)/signin');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Dark hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 36 }]}>
          <LinearGradient
            colors={['rgba(193,123,92,0.22)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
          />
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
        </View>

        {/* Form section */}
        <View style={styles.form}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowLine} />
            <Text style={styles.eyebrowText}>LET'S BEGIN</Text>
          </View>

          <Text style={styles.question}>
            What's your{'\n'}
            <Text style={styles.questionItalic}>little one's</Text> name?
          </Text>

          <View style={[styles.inputWrap, nameError ? styles.inputError : null]}>
            <Text style={styles.inputIcon}>🍼</Text>
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
              returnKeyType="go"
              onSubmitEditing={handleBegin}
            />
          </View>

          {nameError ? (
            <Text style={styles.errorText}>{nameError}</Text>
          ) : (
            <Text style={styles.hint}>
              You can always change this later. This is just for us to make
              their story feel like theirs.
            </Text>
          )}

          <Button
            onPress={handleBegin}
            title="Begin their story →"
            style={styles.ctaBtn}
          />

          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>I'll add this later</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy reassurance */}
        <View style={styles.reassure}>
          <View style={styles.reassureLine} />
          <Text style={styles.reassureText}>
            <Text style={styles.reassureStrong}>🔒 This is your private space.</Text>{' '}
            Only people you invite can see your baby's memories. We never
            share, sell, or use your data. Ever.
          </Text>
        </View>

        {/* Sign in link */}
        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.signinLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { flexGrow: 1 },

  // Hero
  hero: {
    backgroundColor: Colors.ink,
    paddingHorizontal: 28,
    paddingBottom: 40,
    overflow: 'hidden',
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
    color: 'rgba(251,247,242,0.6)',
    lineHeight: 24,
  },

  // Form
  form: { padding: Spacing['2xl'] },
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
  questionItalic: { fontFamily: 'CormorantGaramond_300Light_Italic', color: Colors.sienna },

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
  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
    textDecorationLine: 'underline',
  },

  // Reassurance box
  reassure: {
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.xl,
    padding: Spacing.md + 4,
    paddingLeft: 18,
    backgroundColor: 'rgba(181,196,177,0.15)',
    borderLeftWidth: 2,
    borderLeftColor: Colors.sageDark,
  },
  reassureLine: {},
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

  // Sign in row
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
