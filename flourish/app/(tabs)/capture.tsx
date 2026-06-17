/**
 * Capture screen — opens camera or library, uploads to Storage, saves to Firestore.
 * Toast replaces Alert for all confirmations.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useBabyContext } from '../../src/contexts/BabyContext';
import { createMemory } from '../../src/services/firestore';
import { uploadMemoryPhoto } from '../../src/services/storage';
import { useToast } from '../../src/hooks/useToast';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import { Button } from '../../src/components/Button';
import { sanitizeName } from '../../src/utils/sanitize';

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeBaby } = useBabyContext();
  const { showToast, ToastView } = useToast();

  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Flourish needs camera access to capture memories.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.85, exif: false });
    if (!result.canceled && result.assets[0]) setPickedUri(result.assets[0].uri);
  };

  const openLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Flourish needs access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsEditing: true, quality: 0.85, exif: false });
    if (!result.canceled && result.assets[0]) setPickedUri(result.assets[0].uri);
  };

  const saveMemory = async () => {
    if (!user?.uid || !activeBaby) {
      showToast('No baby profile', 'Please set up your baby profile first.', 'error');
      return;
    }
    setSaving(true);
    try {
      // Upload to Firebase Storage first so the URL is a real remote link
      let mediaURL: string | undefined;
      if (pickedUri) {
        mediaURL = await uploadMemoryPhoto(user.uid, activeBaby.id, pickedUri);
      }

      await createMemory(user.uid, {
        babyId: activeBaby.id,
        type: 'photo',
        title: sanitizeName('New memory'),
        mediaURL,
        capturedAt: new Date(),
      });

      showToast('Saved 🌿', 'Your memory has been preserved.');
      setPickedUri(null);
      setTimeout(() => router.replace('/(tabs)/'), 1600);
    } catch (err) {
      showToast('Save failed', (err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>
            Capture a <Text style={styles.titleItalic}>moment</Text>
          </Text>
          <Text style={styles.sub}>Three taps. One memory. Forever.</Text>
        </View>

        <View style={styles.content}>
          {pickedUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: pickedUri }} style={styles.preview} resizeMode="cover" />
              <TouchableOpacity style={styles.clearBtn} onPress={() => setPickedUri(null)}>
                <Text style={styles.clearBtnText}>✕ Clear</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.captureBtns}>
              <TouchableOpacity style={styles.bigBtn} onPress={openCamera} activeOpacity={0.8}>
                <Text style={styles.bigBtnIcon}>📸</Text>
                <Text style={styles.bigBtnLabel}>Take a photo</Text>
                <Text style={styles.bigBtnSub}>Open camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bigBtn} onPress={openLibrary} activeOpacity={0.8}>
                <Text style={styles.bigBtnIcon}>🖼️</Text>
                <Text style={styles.bigBtnLabel}>From library</Text>
                <Text style={styles.bigBtnSub}>Choose existing</Text>
              </TouchableOpacity>
            </View>
          )}

          {pickedUri && (
            <Button onPress={saveMemory} title="Save this memory →" loading={saving} style={{ marginTop: Spacing.xl }} />
          )}

          <View style={styles.journalSection}>
            <EyebrowLabel>Or write it down</EyebrowLabel>
            <TouchableOpacity style={styles.journalCard} onPress={() => router.push('/journal/new')} activeOpacity={0.8}>
              <Text style={styles.journalIcon}>✍️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.journalTitle}>Write a journal entry</Text>
                <Text style={styles.journalSub}>The things photos can't capture</Text>
              </View>
              <Text style={styles.journalArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {ToastView}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  header: { backgroundColor: Colors.ink, paddingHorizontal: Spacing['2xl'], paddingBottom: Spacing['2xl'] },
  title: { fontFamily: 'CormorantGaramond_300Light', fontSize: 32, color: Colors.cream, marginBottom: 4 },
  titleItalic: { fontFamily: 'CormorantGaramond_300Light_Italic', color: Colors.rose },
  sub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm, color: 'rgba(251,247,242,0.45)' },
  content: { padding: Spacing['2xl'] },
  captureBtns: { gap: 12 },
  bigBtn: {
    backgroundColor: Colors.warm, borderWidth: 1.5, borderColor: 'rgba(196,169,160,0.25)',
    borderRadius: 4, padding: Spacing['2xl'], alignItems: 'center', gap: 8,
  },
  bigBtnIcon: { fontSize: 36 },
  bigBtnLabel: { fontFamily: 'CormorantGaramond_300Light', fontSize: 22, color: Colors.ink },
  bigBtnSub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.inkMedium, letterSpacing: 0.6 },
  previewWrap: { borderRadius: 4, overflow: 'hidden', position: 'relative' },
  preview: { width: '100%', height: 280 },
  clearBtn: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(44,36,32,0.7)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4,
  },
  clearBtnText: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.cream },
  journalSection: { marginTop: Spacing['3xl'] },
  journalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.warm, borderWidth: 1, borderColor: 'rgba(196,169,160,0.25)',
    padding: Spacing.xl, borderRadius: 4,
  },
  journalIcon: { fontSize: 24 },
  journalTitle: { fontFamily: 'DMSans_500Medium', fontSize: Typography.sizes.md, color: Colors.ink },
  journalSub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.inkMedium, marginTop: 2 },
  journalArrow: { fontSize: 20, color: Colors.inkMedium },
});
