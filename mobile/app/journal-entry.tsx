import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Icon } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { addJournalEntry } from '@/firebase/firestore';
import { dailyPrompt } from '@/data/prompts';
import { friendlyError } from '@/lib/errors';
import { sanitizeText } from '@/lib/validation';
import { colors, fonts, radius } from '@/theme';

export default function JournalEntry() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, user } = useAuth();
  const params = useLocalSearchParams<{ prompt?: string; milestone?: string }>();

  const prompt = useMemo(
    () => params.prompt || dailyPrompt(activeBaby?.name),
    [params.prompt, activeBaby?.name],
  );

  const [body, setBody] = useState('');
  const [tagsText, setTagsText] = useState(params.milestone ? String(params.milestone) : '');
  const [saving, setSaving] = useState(false);

  const canSave = sanitizeText(body, 4000).length > 0;

  const save = async () => {
    if (!activeBaby || !user || !canSave) return;
    setSaving(true);
    try {
      const tags = tagsText
        .split(',')
        .map((t) => sanitizeText(t, 24))
        .filter(Boolean);
      await addJournalEntry(activeBaby.id, user.uid, { body, tags });
      router.back();
    } catch (e) {
      Alert.alert('Couldn’t save', friendlyError(e, 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Icon name="close" size={26} color={colors.ink} />
        </Pressable>
        <AppText variant="titleItalic" color={colors.sienna} style={styles.headerTitle}>A new entry</AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.privateRow}>
          <Icon name="lock-closed-outline" size={12} color={colors.inkMuted} />
          <AppText variant="caption">Only you will ever read this</AppText>
        </View>

        <AppText variant="titleItalic" color={colors.ink} style={styles.prompt}>{prompt}</AppText>

        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write freely — there’s no wrong answer here…"
          placeholderTextColor={colors.inkMuted}
          multiline
          autoFocus
          textAlignVertical="top"
          style={styles.bodyInput}
          maxLength={4000}
        />

        <AppText variant="label" style={styles.label}>Tags (optional)</AppText>
        <TextInput
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="3am feed, Week 8, first time"
          placeholderTextColor={colors.inkMuted}
          style={styles.tagsInput}
          maxLength={120}
        />
        <AppText variant="caption" style={styles.tagHint}>Separate with commas.</AppText>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button label="Save entry" loading={saving} disabled={!canSave} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22 },
  scroll: { padding: 24 },
  privateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  prompt: { fontSize: 22, lineHeight: 30, marginBottom: 16 },
  bodyInput: {
    minHeight: 180,
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 18,
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    lineHeight: 26,
    color: colors.inkLight,
  },
  label: { marginTop: 24, marginBottom: 12 },
  tagsInput: {
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  tagHint: { marginTop: 6 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cream,
  },
});
