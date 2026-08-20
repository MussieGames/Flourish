import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Icon, InfoBox, TextField } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { friendlyAuthError } from '@/lib/errors';
import { checkPassword, isValidEmail } from '@/lib/validation';
import { colors, fonts } from '@/theme';

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];
const STRENGTH_COLORS = [colors.danger, colors.danger, colors.gold, colors.sageDark, colors.sageDark];

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Icon name="chevron-back" size={26} color={colors.cream} />
          </Pressable>
          <AppText variant="label">Let’s begin</AppText>
          <AppText variant="display" color={colors.cream} style={styles.title}>
            What’s your{'\n'}
            <AppText variant="displayItalic" color={colors.rose}>little one’s</AppText> name?
          </AppText>
        </View>

        <View style={styles.form}>
          <TextField
            icon="happy-outline"
            serif
            placeholder="e.g. Oliver…"
            value={babyName}
            onChangeText={setBabyName}
            autoCapitalize="words"
            maxLength={40}
          />
          <AppText variant="caption" style={styles.hint}>
            You can change this later — it just makes their story feel like theirs.
          </AppText>

          <View style={styles.gap}>
            <TextField
              icon="mail-outline"
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
              icon="lock-closed-outline"
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
                    { width: `${(strength.score / 4) * 100}%`, backgroundColor: STRENGTH_COLORS[strength.score] },
                  ]}
                />
              </View>
              <AppText variant="caption" color={STRENGTH_COLORS[strength.score]}>
                {STRENGTH_LABELS[strength.score]}
              </AppText>
            </View>
          ) : null}

          {error ? (
            <AppText variant="caption" color={colors.danger} style={styles.error}>{error}</AppText>
          ) : null}

          <View style={styles.button}>
            <Button label="Create your baby’s story" loading={submitting} disabled={!canSubmit} onPress={handleSubmit} />
          </View>
          <AppText variant="caption" color={colors.inkMuted} center style={styles.micro}>
            Free forever at Seedling · No credit card needed
          </AppText>

          <InfoBox accent={colors.sageDark} style={styles.reassure}>
            <View style={styles.reassureRow}>
              <Icon name="lock-closed-outline" size={16} color={colors.sageDark} />
              <AppText variant="caption" color={colors.inkLight} style={styles.reassureText}>
                This is your private space. Only people you invite can ever see your baby’s
                memories. We never share, sell, or train on your data.
              </AppText>
            </View>
          </InfoBox>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  header: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingBottom: 28 },
  back: { marginBottom: 12 },
  title: { marginTop: 12, fontSize: 32, lineHeight: 36 },
  form: { paddingHorizontal: 24, paddingTop: 24 },
  hint: { marginTop: 6, lineHeight: 18 },
  gap: { marginTop: 12 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  strengthTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(196,169,160,0.3)', overflow: 'hidden' },
  strengthFill: { height: 4, borderRadius: 2 },
  error: { marginTop: 12 },
  button: { marginTop: 22 },
  micro: { marginTop: 12 },
  reassure: { marginTop: 24, marginBottom: 32 },
  reassureRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  reassureText: { flex: 1, lineHeight: 18, fontFamily: fonts.body },
});
