/**
 * Capture screen — photo/video picker and journal quick-entry.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useBaby } from '../../src/hooks/useBaby';
import { createMemory } from '../../src/services/firestore';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import { Button } from '../../src/components/Button';
import { sanitizeName } from '../../src/utils/sanitize';

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeBaby } = useBaby(user?.uid ?? null);

  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openPhotoPicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Flourish needs access to your photo library to save memories.',
        [{ text: 'OK' }]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.85,
      exif: false, // strip EXIF for privacy
    });
    if (!result.canceled && result.assets[0]) {
      setPickedImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Flourish needs camera access to capture memories.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
      exif: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedImage(result.assets[0].uri);
    }
  };

  const saveMemory = async () => {
    if (!user?.uid || !activeBaby) {
      Alert.alert('No baby profile', 'Please set up your baby profile first.');
      return;
    }
    setSaving(true);
    try {
      await createMemory(user.uid, {
        babyId: activeBaby.id,
        type: pickedImage ? 'photo' : 'journal',
        title: sanitizeName('New memory'),
        capturedAt: new Date(),
      });
      Alert.alert('Saved! 🌿', 'Your memory has been preserved.', [
        {
          text: 'View memories',
          onPress: () => router.replace('/(tabs)/'),
        },
        { text: 'Capture more' },
      ]);
      setPickedImage(null);
    } catch (err) {
      Alert.alert('Save failed', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
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
        {pickedImage ? (
          <View style={styles.previewWrap}>
            <Image
              source={{ uri: pickedImage }}
              style={styles.preview}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => setPickedImage(null)}
            >
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
            <TouchableOpacity
              style={[styles.bigBtn, styles.bigBtnSecond]}
              onPress={openPhotoPicker}
              activeOpacity={0.8}
            >
              <Text style={styles.bigBtnIcon}>🖼️</Text>
              <Text style={styles.bigBtnLabel}>From library</Text>
              <Text style={styles.bigBtnSub}>Choose existing</Text>
            </TouchableOpacity>
          </View>
        )}

        {pickedImage && (
          <Button
            onPress={saveMemory}
            title="Save this memory →"
            loading={saving}
            style={{ marginTop: Spacing.xl }}
          />
        )}

        {/* Quick journal */}
        <View style={styles.journalSection}>
          <EyebrowLabel>Or write it down</EyebrowLabel>
          <TouchableOpacity
            style={styles.journalCard}
            onPress={() => router.push('/journal/new')}
            activeOpacity={0.8}
          >
            <Text style={styles.journalIcon}>✍️</Text>
            <View>
              <Text style={styles.journalTitle}>Write a journal entry</Text>
              <Text style={styles.journalSub}>
                The things photos can't capture
              </Text>
            </View>
            <Text style={styles.journalArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
  },
  title: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 32,
    color: Colors.cream,
    marginBottom: 4,
  },
  titleItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.rose,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: 'rgba(251,247,242,0.45)',
  },
  content: { padding: Spacing['2xl'] },

  captureBtns: { gap: 12 },
  bigBtn: {
    backgroundColor: Colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.25)',
    borderRadius: 4,
    padding: Spacing['2xl'],
    alignItems: 'center',
    gap: 8,
  },
  bigBtnSecond: {
    borderColor: 'rgba(196,169,160,0.25)',
  },
  bigBtnIcon: { fontSize: 36 },
  bigBtnLabel: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 22,
    color: Colors.ink,
  },
  bigBtnSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
    letterSpacing: 0.6,
  },

  previewWrap: {
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  preview: { width: '100%', height: 280 },
  clearBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(44,36,32,0.7)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  clearBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.cream,
  },

  journalSection: { marginTop: Spacing['3xl'] },
  journalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.warm,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.25)',
    padding: Spacing.xl,
    borderRadius: 4,
  },
  journalIcon: { fontSize: 24 },
  journalTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: Typography.sizes.md,
    color: Colors.ink,
  },
  journalSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
    marginTop: 2,
  },
  journalArrow: { marginLeft: 'auto', fontSize: 20, color: Colors.inkMedium },
});
