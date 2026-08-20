import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Hero, SectionLabel } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { addMemory } from '@/firebase/firestore';
import { uploadMemoryAsset } from '@/firebase/storage';
import { friendlyError } from '@/lib/errors';
import { sanitizeText } from '@/lib/validation';
import { colors, fonts, radius } from '@/theme';
import type { MemoryKind } from '@/types/models';

interface Picked {
  uri: string;
  contentType: string;
  kind: MemoryKind;
}

export default function Capture() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, user } = useAuth();

  const [picked, setPicked] = useState<Picked | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const guessContentType = (asset: ImagePicker.ImagePickerAsset, fallback: string) => {
    if (asset.mimeType) return asset.mimeType;
    return fallback;
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to add memories.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
      allowsEditing: false,
    });
    handleResult(result);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to capture moments.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    handleResult(result);
  };

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const isVideo = asset.type === 'video';
    setPicked({
      uri: asset.uri,
      contentType: guessContentType(asset, isVideo ? 'video/mp4' : 'image/jpeg'),
      kind: isVideo ? 'video' : 'photo',
    });
  };

  const save = async () => {
    if (!picked || !activeBaby || !user) return;
    setSaving(true);
    try {
      const storagePath = await uploadMemoryAsset(
        activeBaby.id,
        user.uid,
        picked.uri,
        picked.contentType,
      );
      await addMemory(activeBaby.id, user.uid, {
        kind: picked.kind,
        title: sanitizeText(title, 80) || (picked.kind === 'video' ? 'A little video' : 'A new memory'),
        storagePath,
      });
      setPicked(null);
      setTitle('');
      router.push('/(tabs)/scrapbook');
    } catch (e) {
      Alert.alert('Couldn’t save', friendlyError(e, 'Something went wrong uploading that.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Hero paddingTop={insets.top + 20} glow="rgba(193,123,92,0.2)">
        <AppText variant="label" color={colors.gold}>
          Save a moment
        </AppText>
        <AppText variant="display" color={colors.cream}>
          Capture{' '}
          <AppText variant="displayItalic" color={colors.rose}>
            this.
          </AppText>
        </AppText>
        <AppText variant="caption" color={colors.onDark45} style={styles.sub}>
          One tap. It&apos;s saved to {activeBaby?.name ?? 'your baby'}&apos;s private scrapbook.
        </AppText>
      </Hero>

      <View style={styles.body}>
        {picked ? (
          <View>
            <View style={styles.previewWrap}>
              <Image source={{ uri: picked.uri }} style={styles.preview} contentFit="cover" />
            </View>
            <SectionLabel>Give it a title</SectionLabel>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="First bath, sleeping angel…"
              placeholderTextColor={colors.inkMuted}
              maxLength={80}
              style={styles.titleInput}
            />
            <View style={styles.saveRow}>
              <View style={styles.flex1}>
                <Button label="Discard" variant="outline" onPress={() => setPicked(null)} />
              </View>
              <View style={styles.flex1}>
                <Button label="Save →" loading={saving} onPress={save} />
              </View>
            </View>
          </View>
        ) : (
          <>
            <SectionLabel>How would you like to capture it?</SectionLabel>
            <CaptureOption icon="camera" title="Take a photo" subtitle="Open the camera" onPress={takePhoto} />
            <CaptureOption
              icon="images"
              title="Choose from library"
              subtitle="Pick a photo or video"
              onPress={pickFromLibrary}
            />
            <CaptureOption
              icon="create"
              title="Write a journal entry"
              subtitle="The things photos can’t capture"
              onPress={() => router.push('/journal-entry')}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function CaptureOption({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
    >
      <View style={styles.optionIcon}>
        <Ionicons name={icon} size={22} color={colors.sienna} />
      </View>
      <View style={styles.flex1}>
        <AppText variant="titleItalic" color={colors.ink} style={styles.optionTitle}>
          {title}
        </AppText>
        <AppText variant="caption">{subtitle}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  sub: { marginTop: 8 },
  body: { padding: 24 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 18,
    marginBottom: 12,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(193,123,92,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { fontSize: 20 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  previewWrap: { borderRadius: radius.md, overflow: 'hidden', marginBottom: 20 },
  preview: { width: '100%', height: 240, backgroundColor: colors.blush },
  titleInput: {
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderColor: 'rgba(196,169,160,0.35)',
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 20,
  },
  saveRow: { flexDirection: 'row', gap: 10 },
});
