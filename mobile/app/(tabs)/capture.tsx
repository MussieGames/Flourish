import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Icon, SectionLabel } from '@/components';
import type { IconName } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useMilestones } from '@/hooks/useBabyData';
import { addMemory, captureMilestone } from '@/firebase/firestore';
import { uploadMemoryAsset } from '@/firebase/storage';
import { preciseAge, weekdayName } from '@/lib/age';
import { formatTime } from '@/lib/format';
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
  const { items: milestones } = useMilestones(activeBaby?.id);
  const nextMilestone = useMemo(() => milestones.find((m) => m.status === 'upcoming'), [milestones]);

  const [picked, setPicked] = useState<Picked | null>(null);
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const ageTag = (() => {
    const pa = preciseAge(activeBaby?.birthDate, now);
    return `${activeBaby?.name ?? 'Baby'}${pa ? ` · ${pa}` : ''} · ${weekdayName(now)} ${formatTime(now)}`;
  })();

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Please allow photo access to add memories.');
    handleResult(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.85 }));
  };
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Please allow camera access to capture moments.');
    handleResult(await ImagePicker.launchCameraAsync({ quality: 0.85 }));
  };
  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    const isVideo = asset.type === 'video';
    setPicked({
      uri: asset.uri,
      contentType: asset.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg'),
      kind: isVideo ? 'video' : 'photo',
    });
  };

  const persist = async (markMilestone: boolean) => {
    if (!picked || !activeBaby || !user) return;
    setSaving(true);
    try {
      const storagePath = await uploadMemoryAsset(activeBaby.id, user.uid, picked.uri, picked.contentType);
      await addMemory(activeBaby.id, user.uid, {
        kind: picked.kind,
        title: markMilestone && nextMilestone ? nextMilestone.label : picked.kind === 'video' ? 'A little video' : 'A new memory',
        caption: sanitizeText(caption, 500),
        storagePath,
      });
      if (markMilestone && nextMilestone) {
        await captureMilestone(activeBaby.id, nextMilestone.id);
        setPicked(null);
        setCaption('');
        router.push({ pathname: '/milestone', params: { id: nextMilestone.id, key: nextMilestone.key, label: nextMilestone.label } });
        return;
      }
      setPicked(null);
      setCaption('');
      router.push('/(tabs)/scrapbook');
    } catch (e) {
      Alert.alert('Couldn’t save', friendlyError(e, 'Something went wrong uploading that.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}>
        <LinearGradient colors={['rgba(193,123,92,0.2)', 'transparent']} start={{ x: 0.8, y: 1 }} end={{ x: 0.2, y: 0 }} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <AppText variant="label" color={colors.gold}>Save a moment</AppText>
        <AppText variant="display" color={colors.cream}>
          Catch <AppText variant="displayItalic" color={colors.rose}>this.</AppText>
        </AppText>
        <AppText variant="caption" color={colors.onDark45} style={styles.sub}>
          One tap — kept safe in {activeBaby?.name ?? 'your baby'}’s private scrapbook.
        </AppText>
      </View>

      <View style={styles.body}>
        {picked ? (
          <View>
            <View style={styles.previewWrap}>
              <Image source={{ uri: picked.uri }} style={styles.preview} contentFit="cover" />
              <View style={styles.caughtBadge}>
                <Icon name="checkmark" size={12} color={colors.white} />
                <AppText variant="label" color={colors.white} style={styles.caughtText}>Caught</AppText>
              </View>
              <LinearGradient colors={['transparent', 'rgba(44,36,32,0.75)']} style={styles.previewOverlay}>
                <AppText variant="serifItalic" color={colors.cream} style={styles.ageTag}>{ageTag}</AppText>
              </LinearGradient>
            </View>

            <View style={styles.captionCard}>
              <AppText variant="label" color={colors.inkMuted} style={styles.captionLabel}>What were you feeling right now?</AppText>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Write it before it fades…"
                placeholderTextColor={colors.inkMuted}
                multiline
                style={styles.captionInput}
                maxLength={500}
              />
            </View>

            <View style={styles.saveRow}>
              {nextMilestone ? (
                <Pressable style={styles.markBtn} disabled={saving} onPress={() => persist(true)}>
                  <Icon name="checkmark" size={14} color={colors.sageDark} />
                  <AppText variant="label" color={colors.sageDark} style={styles.markText} numberOfLines={1}>
                    Mark as {nextMilestone.label}
                  </AppText>
                </Pressable>
              ) : null}
            </View>
            <View style={styles.actionsRow}>
              <View style={styles.flex1}><Button label="Discard" variant="outline" onPress={() => { setPicked(null); setCaption(''); }} /></View>
              <View style={styles.flex1}><Button label="Save" loading={saving} onPress={() => persist(false)} /></View>
            </View>
          </View>
        ) : (
          <>
            <SectionLabel>How would you like to capture it?</SectionLabel>
            <Option icon="camera-outline" title="Take a photo" subtitle="Open the camera" onPress={takePhoto} />
            <Option icon="images-outline" title="Choose from library" subtitle="Pick a photo or video" onPress={pickFromLibrary} />
            <Option icon="create-outline" title="Write a journal entry" subtitle="The things photos can’t capture" onPress={() => router.push('/journal-entry')} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Option({ icon, title, subtitle, onPress }: { icon: IconName; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
      <View style={styles.optionIcon}><Icon name={icon} size={22} color={colors.sienna} /></View>
      <View style={styles.flex1}>
        <AppText variant="titleItalic" color={colors.ink} style={styles.optionTitle}>{title}</AppText>
        <AppText variant="caption">{subtitle}</AppText>
      </View>
      <Icon name="chevron-forward" size={18} color={colors.inkMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  hero: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingBottom: 22, overflow: 'hidden' },
  sub: { marginTop: 8 },
  body: { padding: 24 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.warm, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 18, marginBottom: 12,
  },
  optionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(193,123,92,0.1)', alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: 20 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  previewWrap: { borderRadius: radius.md, overflow: 'hidden', marginBottom: 16, position: 'relative' },
  preview: { width: '100%', height: 260, backgroundColor: colors.blush },
  caughtBadge: {
    position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(122,158,126,0.9)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10,
  },
  caughtText: { letterSpacing: 1 },
  previewOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, paddingTop: 28 },
  ageTag: { fontSize: 13 },
  captionCard: { backgroundColor: colors.warm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, marginBottom: 14 },
  captionLabel: { marginBottom: 8 },
  captionInput: { minHeight: 60, fontFamily: fonts.serifItalic, fontSize: 15, lineHeight: 24, color: colors.inkLight },
  saveRow: { marginBottom: 10 },
  markBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(122,158,126,0.14)', borderWidth: 1, borderColor: 'rgba(122,158,126,0.3)',
    paddingVertical: 12, borderRadius: radius.sm,
  },
  markText: { letterSpacing: 0.8 },
  actionsRow: { flexDirection: 'row', gap: 10 },
});
