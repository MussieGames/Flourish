/**
 * New journal entry — mood, photo, text, tags.
 * Photo upload path: local URI → Firebase Storage → Firestore mediaURL.
 * entryDate computed fresh on mount (not at module level).
 * Toast replaces Alert for save confirmations.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/hooks/useAuth';
import { useBabyContext } from '../../src/contexts/BabyContext';
import { createJournalEntry } from '../../src/services/firestore';
import { uploadJournalPhoto } from '../../src/services/storage';
import { useToast } from '../../src/hooks/useToast';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { sanitizeJournalText } from '../../src/utils/sanitize';

const MOODS = ['😊', '🥰', '😭', '😴', '🤗', '😮', '🥺', '💪'];
const TAG_SUGGESTIONS = ['3am feed', 'Milestone', 'First time', 'Weekend', 'Morning', 'Evening'];

export default function NewJournalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeBaby } = useBabyContext();
  const { showToast, ToastView } = useToast();

  // Computed fresh on mount — not stale from a module-level const
  const [entryDate] = useState(() => new Date());

  const [text, setText] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 5)
    );

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Flourish needs access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      exif: false,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Flourish needs camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      exif: false,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    const cleanText = sanitizeJournalText(text);
    if (cleanText.length < 3) {
      showToast('Write something first', 'Add at least a few words to save this entry.', 'error');
      return;
    }
    if (!user?.uid || !activeBaby) {
      showToast('No profile', 'Please set up your baby profile first.', 'error');
      return;
    }

    setSaving(true);
    try {
      // If a photo was selected, upload it to Firebase Storage first
      let photoURL: string | undefined;
      if (photoUri) {
        const tempEntryId = `temp_${Date.now()}`;
        photoURL = await uploadJournalPhoto(user.uid, tempEntryId, photoUri);
      }

      await createJournalEntry(user.uid, {
        babyId: activeBaby.id,
        text: cleanText,
        mood: mood ?? undefined,
        tags: tags.length > 0 ? tags : undefined,
        photoURL,
        capturedAt: entryDate,
      });

      showToast('Saved 🌿', 'Your entry has been preserved.');
      setText('');
      setMood(null);
      setTags([]);
      setPhotoUri(null);

      // Brief delay so the toast is visible before navigation
      setTimeout(() => router.replace('/journal/'), 1600);
    } catch (err) {
      showToast('Save failed', (err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              New <Text style={styles.titleItalic}>entry</Text>
            </Text>
            <Text style={styles.sub}>
              {entryDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}
              {entryDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {/* Mood */}
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

          {/* Photo */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ADD A PHOTO (OPTIONAL)</Text>
            {photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.photoImage} resizeMode="cover" />
                <TouchableOpacity style={styles.photoRemove} onPress={() => setPhotoUri(null)}>
                  <Text style={styles.photoRemoveText}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPickerRow}>
                <TouchableOpacity style={styles.photoPickBtn} onPress={handleTakePhoto} activeOpacity={0.8}>
                  <Text style={styles.photoPickIcon}>📸</Text>
                  <Text style={styles.photoPickLabel}>Take photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoPickBtn} onPress={handlePickPhoto} activeOpacity={0.8}>
                  <Text style={styles.photoPickIcon}>🖼️</Text>
                  <Text style={styles.photoPickLabel}>Choose photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Text */}
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
                  <Text style={[styles.tagChipText, tags.includes(tag) && styles.tagChipTextActive]}>
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

        {ToastView}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },

  header: {
    paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing.xl,
    borderBottomWidth: 1, borderBottomColor: 'rgba(196,169,160,0.2)',
    backgroundColor: Colors.warm,
  },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 24, color: Colors.ink },
  title: { fontFamily: 'CormorantGaramond_300Light', fontSize: 28, color: Colors.ink, marginBottom: 4 },
  titleItalic: { fontFamily: 'CormorantGaramond_300Light_Italic', color: Colors.sienna },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.inkMedium },

  section: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'] },
  sectionLabel: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, letterSpacing: 1.8, color: Colors.sienna, marginBottom: Spacing.md },

  moodRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  moodBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.3)', backgroundColor: Colors.warm,
    alignItems: 'center', justifyContent: 'center',
  },
  moodBtnActive: { borderColor: Colors.sienna, backgroundColor: 'rgba(193,123,92,0.1)' },
  moodEmoji: { fontSize: 20 },

  photoPreview: { borderRadius: 4, overflow: 'hidden', position: 'relative' },
  photoImage: { width: '100%', height: 200 },
  photoRemove: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(44,36,32,0.75)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4,
  },
  photoRemoveText: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.cream },
  photoPickerRow: { flexDirection: 'row', gap: 10 },
  photoPickBtn: {
    flex: 1, paddingVertical: 20, backgroundColor: Colors.warm,
    borderWidth: 1, borderColor: 'rgba(196,169,160,0.3)', borderRadius: 2,
    alignItems: 'center', gap: 6,
  },
  photoPickIcon: { fontSize: 22 },
  photoPickLabel: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.inkMedium, letterSpacing: 0.4 },

  textArea: {
    backgroundColor: Colors.warm, borderWidth: 1.5, borderColor: 'rgba(196,169,160,0.35)',
    borderRadius: 2, padding: 18, fontFamily: 'Lora_400Regular_Italic',
    fontSize: Typography.sizes.md, color: Colors.inkLight, lineHeight: 26, minHeight: 180,
  },
  charCount: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.inkMedium, textAlign: 'right', marginTop: 4 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(196,169,160,0.3)', backgroundColor: Colors.warm,
  },
  tagChipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  tagChipText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.inkMedium },
  tagChipTextActive: { color: Colors.cream },

  footer: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'], gap: 12 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm, color: Colors.inkMedium, textDecorationLine: 'underline' },
});
