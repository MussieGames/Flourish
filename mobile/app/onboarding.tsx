import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { AppText, Button, Hero, InfoBox } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { createBaby } from '@/firebase/firestore';
import { toISODate } from '@/lib/age';
import { friendlyError } from '@/lib/errors';
import { isValidName, sanitizeName } from '@/lib/validation';
import { colors, fonts, radius } from '@/theme';

export default function Onboarding() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(profile?.displayName ?? '');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const birthDate = useMemo(() => buildDate(day, month, year), [day, month, year]);
  const canSubmit = isValidName(name) && !!birthDate;

  const handleSubmit = async () => {
    if (!user) return;
    setError(null);
    setSubmitting(true);
    try {
      await createBaby(user.uid, sanitizeName(name), birthDate ? toISODate(birthDate) : null);
      // Guard will route into the tabs once the baby document arrives.
    } catch (e) {
      setError(friendlyError(e, 'We couldn’t save that. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Hero paddingTop={76} style={styles.hero}>
          <AppText style={styles.emoji}>👶</AppText>
          <AppText variant="display" color={colors.cream}>
            Tell us about{'\n'}
            <AppText variant="displayItalic" color={colors.rose}>
              your little one.
            </AppText>
          </AppText>
          <AppText variant="bodyLight" color={colors.onDark60} style={styles.heroPara}>
            Just two things, then we&apos;ll build their world together.
          </AppText>
        </Hero>

        <View style={styles.form}>
          <AppText variant="label">Their name</AppText>
          <View style={styles.nameWrap}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Oliver"
              placeholderTextColor={colors.inkMuted}
              autoCapitalize="words"
              maxLength={40}
              style={styles.nameInput}
            />
          </View>

          <AppText variant="label" style={styles.dobLabel}>
            Date of birth
          </AppText>
          <View style={styles.dobRow}>
            <DateBox value={day} onChange={setDay} placeholder="DD" max={2} />
            <AppText style={styles.slash}>/</AppText>
            <DateBox value={month} onChange={setMonth} placeholder="MM" max={2} />
            <AppText style={styles.slash}>/</AppText>
            <DateBox value={year} onChange={setYear} placeholder="YYYY" max={4} flex={1.6} />
          </View>

          {error ? (
            <AppText variant="caption" color={colors.danger} style={styles.error}>
              {error}
            </AppText>
          ) : null}

          <View style={styles.button}>
            <Button
              label="Create their world →"
              loading={submitting}
              disabled={!canSubmit}
              onPress={handleSubmit}
            />
          </View>

          <InfoBox accent={colors.sageDark} style={styles.reassure}>
            <AppText variant="caption" color={colors.inkLight} style={styles.reassureText}>
              We use the birth date to surface the right milestones and the age-adaptive scrapbook
              — nothing else. It stays private to you.
            </AppText>
          </InfoBox>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DateBox({
  value,
  onChange,
  placeholder,
  max,
  flex = 1,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  max: number;
  flex?: number;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, max))}
      placeholder={placeholder}
      placeholderTextColor={colors.inkMuted}
      keyboardType="number-pad"
      style={[styles.dateBox, { flex }]}
    />
  );
}

function buildDate(day: string, month: string, year: string): Date | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y || year.length !== 4) return null;
  const date = new Date(y, m - 1, d);
  const valid =
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  if (!valid) return null;
  const now = new Date();
  // Reject future dates and absurdly old ones.
  if (date.getTime() > now.getTime()) return null;
  if (y < now.getFullYear() - 25) return null;
  return date;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  hero: { paddingBottom: 40 },
  emoji: { fontSize: 36, marginBottom: 16 },
  heroPara: { marginTop: 12 },
  form: { paddingHorizontal: 24, paddingTop: 28 },
  nameWrap: { marginTop: 4 },
  nameInput: {
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.35)',
    borderRadius: radius.sm,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: fonts.displayItalic,
    fontSize: 22,
    color: colors.ink,
  },
  dobLabel: { marginTop: 24 },
  dobRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  slash: { fontFamily: fonts.display, fontSize: 24, color: colors.inkMuted },
  dateBox: {
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.35)',
    borderRadius: radius.sm,
    paddingVertical: 16,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.ink,
  },
  error: { marginTop: 16 },
  button: { marginTop: 24 },
  reassure: { marginTop: 24 },
  reassureText: { lineHeight: 18 },
});
