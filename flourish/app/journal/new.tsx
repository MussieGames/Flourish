/**
 * New journal entry composer screen.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useBaby } from '../../src/hooks/useBaby';
import { createJournalEntry } from '../../src/services/firestore';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { sanitizeJournalText, sanitizeName } from '../../src/utils/sanitize';

const MOODS = ['😊', '🥰', '😭', '😴', '🤗', '😮', '🥺', '💪'];
const TAG_SUGGESTIONS = ['3am feed', 'Milestone', 'First time', 'Weekend', 'Morning', 'Evening'];

export default function NewJournalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeBaby } = useBaby(user?.uid ?? null);

  const [text, setText] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 5)
    );
  };

  const handleSave = async () => {
    const cleanText = sanitizeJournalText(text);
    if (!cleanText || cleanText.length < 3) {
      Alert.alert('Write something', 'Add at least a few words to save this entry.');
      return;
    }
    if (!user?.uid || !activeBaby) {
      Alert.alert('No profile', 'Please set up your profile first.');
      return;
    }

    setSaving(true);
    try {
      await createJournalEntry(user.uid, {
        babyId: activeBaby.id,
        text: cleanText,
        mood: mood ?? undefined,
        tags: tags.length > 0 ? tags : undefined,
        capturedAt: new Date(),
      });
      Alert.alert('Saved 🌿', 'Your journal entry has been preserved.', [
        {
          text: 'View journal',
          onPress: () => router.replace('/journal/'),
        },
        { text: 'Write more' },
      ]);
      setText('');
      setMood(null);
      setTags([]);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            New <Text style={styles.titleItalic}>entry</Text>
          </Text>
          <Text style={styles.sub}>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}{' '}
            ·{' '}
            {new Date().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Mood selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW ARE YOU FEELING?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.moodBtn, mood === m && styles.moodBtnActive]}
                onPress={() => setMood(mood === m ? null : m)}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text area */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WRITE YOUR ENTRY</Text>
          <TextInput
            style={styles.textArea}
            placeholder="What are you feeling right now? What do you want to remember about this moment?"
            placeholderTextColor={Colors.inkMedium}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            value={text}
            onChangeText={(t) => setText(t.slice(0, 5000))}
            maxLength={5000}
          />
          <Text style={styles.charCount}>{text.length}/5000</Text>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ADD TAGS (OPTIONAL)</Text>
          <View style={styles.tagRow}>
            {TAG_SUGGESTIONS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, tags.includes(tag) && styles.tagChipActive]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tagChipText,
                    tags.includes(tag) && styles.tagChipTextActive,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Button onPress={handleSave} title="Save this entry 🌿" loading={saving} />
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },

  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,169,160,0.2)',
    backgroundColor: Colors.warm,
  },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 24, color: Colors.ink },
  title: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 28,
    color: Colors.ink,
    marginBottom: 4,
  },
  titleItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.sienna,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
  },

  section: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
  },
  sectionLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    letterSpacing: 1.8,
    color: Colors.sienna,
    marginBottom: Spacing.md,
  },

  moodRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  moodBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.3)',
    backgroundColor: Colors.warm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBtnActive: {
    borderColor: Colors.sienna,
    backgroundColor: 'rgba(193,123,92,0.1)',
  },
  moodEmoji: { fontSize: 20 },

  textArea: {
    backgroundColor: Colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.35)',
    borderRadius: 2,
    padding: 18,
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: Typography.sizes.md,
    color: Colors.inkLight,
    lineHeight: 26,
    minHeight: 180,
  },
  charCount: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
    textAlign: 'right',
    marginTop: 4,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.3)',
    backgroundColor: Colors.warm,
  },
  tagChipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  tagChipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: Colors.inkMedium,
  },
  tagChipTextActive: { color: Colors.cream },

  footer: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    gap: 12,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.inkMedium,
    textDecorationLine: 'underline',
  },
});
