import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { AppText, Button } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { addJournalEntry } from '@/firebase/firestore';
import { friendlyError } from '@/lib/errors';
import { sanitizeText } from '@/lib/validation';
import { colors, fonts, radius } from '@/theme';
import type { Mood } from '@/types/models';

const MOODS: Mood[] = ['🥰', '😊', '😴', '🥲', '😭', '🤯'];

export default function JournalEntry() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, user } = useAuth();

  const [body, setBody] = useState('');
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const [tagsText, setTagsText] = useState('');
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
      await addJournalEntry(activeBaby.id, user.uid, { body, mood, tags });
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
          <Ionicons name="close" size={26} color={colors.ink} />
        </Pressable>
        <AppText variant="titleItalic" color={colors.sienna} style={styles.headerTitle}>
          A new entry
        </AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <AppText variant="caption" style={styles.prompt}>
          What are you feeling right now? The smell, the thought, the thing you&apos;ll forget by
          morning.
        </AppText>

        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="He fell asleep on my chest tonight…"
          placeholderTextColor={colors.inkMuted}
          multiline
          textAlignVertical="top"
          style={styles.bodyInput}
          maxLength={4000}
        />

        <AppText variant="label" style={styles.label}>
          How does this moment feel?
        </AppText>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <Pressable
              key={m}
              onPress={() => setMood((cur) => (cur === m ? undefined : m))}
              style={[styles.moodChip, mood === m && styles.moodSelected]}
            >
              <AppText style={styles.moodEmoji}>{m}</AppText>
            </Pressable>
          ))}
        </View>

        <AppText variant="label" style={styles.label}>
          Tags (optional)
        </AppText>
        <TextInput
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="3am feed, Week 8, First time"
          placeholderTextColor={colors.inkMuted}
          style={styles.tagsInput}
          maxLength={120}
        />
        <AppText variant="caption" style={styles.tagHint}>
          Separate with commas.
        </AppText>
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
  prompt: { lineHeight: 18, marginBottom: 16 },
  bodyInput: {
    minHeight: 160,
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
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodSelected: { borderColor: colors.sienna, backgroundColor: 'rgba(193,123,92,0.1)' },
  moodEmoji: { fontSize: 24 },
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
