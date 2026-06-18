/**
 * Scrapbook — two sections:
 *  1. Memory gallery in polaroid/scrapbook style (top)
 *  2. Age-adaptive sticker picker (bottom) to decorate pages
 *
 * This screen IS the scrapbook — not just a sticker picker.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useBabyContext } from '../../src/contexts/BabyContext';
import { getMemoriesForBaby } from '../../src/services/firestore';
import { useToast } from '../../src/hooks/useToast';
import { STICKER_ERAS } from '../../src/constants/stickers';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import { MemoryThumbnail } from '../../src/components/MemoryThumbnail';
import type { BabyEra, Memory } from '../../src/types';
import { format } from 'date-fns';

const ERA_BUTTONS: { id: BabyEra; label: string }[] = [
  { id: 'baby', label: '🍼 Baby' },
  { id: 'little', label: '🎒 Little One' },
  { id: 'growing', label: '⚽ Growing Up' },
  { id: 'teen', label: '🎵 Teen' },
];

// Slight random rotation for the polaroid feel — deterministic per index
const POLAROID_ROTATIONS = [-1.8, 1.2, -0.8, 1.5, -1.2, 0.9, -1.6, 1.1];

export default function ScrapbookScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeBaby, ageInfo } = useBabyContext();
  const { showToast, ToastView } = useToast();

  const [memories, setMemories] = useState<Memory[]>([]);
  const currentEra = (ageInfo?.era ?? 'baby') as BabyEra;
  const [selectedEra, setSelectedEra] = useState<BabyEra>(currentEra);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(0);
  const [selectedCat, setSelectedCat] = useState(0);

  const eraData = STICKER_ERAS[selectedEra];

  useEffect(() => {
    if (!user?.uid || !activeBaby?.id) return;
    getMemoriesForBaby(user.uid, activeBaby.id, 12).then(setMemories);
  }, [user?.uid, activeBaby?.id]);

  const handleSave = () => {
    const sticker = eraData.stickers[selectedSticker ?? 0];
    showToast(
      `${sticker?.emoji ?? '⭐'} added`,
      `${sticker?.name ?? 'Sticker'} saved to ${activeBaby?.name ?? 'your'}'s scrapbook.`
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — no back button; this is a root tab */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <LinearGradient
            colors={['rgba(193,123,92,0.18)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <Text style={styles.headerTitle}>
            {activeBaby?.name ?? 'Your'}'s{' '}
            <Text style={styles.headerTitleItalic}>Scrapbook</Text>
          </Text>
          <Text style={styles.headerSub}>
            {memories.length > 0
              ? `${memories.length} ${memories.length === 1 ? 'memory' : 'memories'} preserved`
              : 'Every moment, beautifully kept'}
          </Text>
        </View>

        {/* ── Memory gallery ────────────────────────────────────────── */}
        <View style={styles.section}>
          <EyebrowLabel>Memories</EyebrowLabel>

          {memories.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyGallery}
              onPress={() => router.push('/(tabs)/capture')}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyGalleryEmoji}>📸</Text>
              <Text style={styles.emptyGalleryTitle}>Your scrapbook is waiting.</Text>
              <Text style={styles.emptyGallerySub}>
                Capture your first memory and it will appear here.
              </Text>
              <View style={styles.emptyGalleryCta}>
                <Text style={styles.emptyGalleryCtaText}>CAPTURE A MOMENT →</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.memoryGrid}>
              {memories.map((mem, i) => (
                <View
                  key={mem.id}
                  style={[
                    styles.polaroid,
                    { transform: [{ rotate: `${POLAROID_ROTATIONS[i % POLAROID_ROTATIONS.length]}deg` }] },
                  ]}
                >
                  {/* Washi tape */}
                  <View style={styles.polaroidTape} />

                  {/* Photo area */}
                  <MemoryThumbnail memory={mem} index={i} height={110} />

                  {/* Caption area */}
                  <View style={styles.polaroidCaption}>
                    <Text style={styles.polaroidTitle} numberOfLines={1}>{mem.title}</Text>
                    <Text style={styles.polaroidDate}>
                      {format(mem.capturedAt, 'd MMM yyyy')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Sticker picker ────────────────────────────────────────── */}
        <View style={[styles.section, { marginTop: Spacing['3xl'] }]}>
          <EyebrowLabel>Decorate a page</EyebrowLabel>

          {/* Era selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eraStrip}
          >
            {ERA_BUTTONS.map((btn) => (
              <TouchableOpacity
                key={btn.id}
                style={[styles.eraBtn, selectedEra === btn.id && styles.eraBtnActive]}
                onPress={() => { setSelectedEra(btn.id); setSelectedSticker(0); setSelectedCat(0); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.eraBtnText, selectedEra === btn.id && styles.eraBtnTextActive]}>
                  {btn.label}
                </Text>
                {btn.id === currentEra && (
                  <View style={styles.autoChip}>
                    <Text style={styles.autoChipText}>Auto</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Preview canvas */}
          <View style={styles.previewWrap}>
            <LinearGradient colors={['#E8C4B0', '#C4907A']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <View style={styles.previewTape} />
            <Text style={styles.previewPhoto}>{eraData.preview}</Text>
            <Text style={styles.placedSticker1}>
              {selectedSticker !== null ? eraData.stickers[selectedSticker]?.emoji : eraData.s1}
            </Text>
            <Text style={styles.placedSticker2}>{eraData.s2}</Text>
            <Text style={styles.previewCaption}>{eraData.caption}</Text>
          </View>

          {/* Era info bar */}
          <View style={styles.eraBar}>
            <Text style={styles.eraBarLabel}>{eraData.label}</Text>
            <Text style={styles.eraBarNote}>
              {selectedEra === currentEra ? 'Auto-selected ✓' : eraData.note}
            </Text>
          </View>

          {/* Category filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catStrip}
          >
            {eraData.cats.map((cat, i) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, selectedCat === i && styles.catBtnActive]}
                onPress={() => setSelectedCat(i)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catText, selectedCat === i && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sticker grid */}
          <View style={styles.stickerGrid}>
            {eraData.stickers.map((sticker, i) => (
              <TouchableOpacity
                key={`${sticker.emoji}-${i}`}
                style={[styles.stickerItem, selectedSticker === i && styles.stickerItemSelected]}
                onPress={() => setSelectedSticker(i)}
                activeOpacity={0.8}
              >
                <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                <Text style={styles.stickerName}>{sticker.name}</Text>
                {selectedSticker === i && <Text style={styles.stickerTick}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => setSelectedSticker(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineBtnText}>CLEAR ALL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filledBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.filledBtnText}>SAVE TO PAGE →</Text>
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

  // Header
  header: {
    backgroundColor: Colors.ink, paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'], overflow: 'hidden',
  },
  headerTitle: {
    fontFamily: 'CormorantGaramond_300Light', fontSize: 30,
    color: Colors.cream, lineHeight: 36, marginBottom: 4,
  },
  headerTitleItalic: { fontFamily: 'CormorantGaramond_300Light_Italic', color: Colors.rose },
  headerSub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm, color: 'rgba(251,247,242,0.45)' },

  section: { paddingHorizontal: Spacing.xl, paddingTop: Spacing['2xl'] },

  // Empty gallery state
  emptyGallery: {
    backgroundColor: Colors.warm, borderWidth: 1, borderColor: 'rgba(196,169,160,0.2)',
    padding: Spacing['3xl'], alignItems: 'center', gap: 10, marginBottom: Spacing.xl,
  },
  emptyGalleryEmoji: { fontSize: 36, marginBottom: 4 },
  emptyGalleryTitle: { fontFamily: 'CormorantGaramond_300Light_Italic', fontSize: 22, color: Colors.ink, textAlign: 'center' },
  emptyGallerySub: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm, color: Colors.inkMedium, textAlign: 'center', lineHeight: 20 },
  emptyGalleryCta: { marginTop: 8, paddingVertical: 10, paddingHorizontal: Spacing.xl, backgroundColor: Colors.sienna, borderRadius: 2 },
  emptyGalleryCtaText: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, letterSpacing: 1.2, color: '#fff' },

  // Polaroid memory grid
  memoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'flex-start', marginBottom: Spacing.xl },
  polaroid: {
    width: '45%',
    backgroundColor: Colors.warm,
    shadowColor: '#2C2420',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'visible',
    position: 'relative',
    marginTop: 8,
  },
  polaroidTape: {
    position: 'absolute',
    top: -6,
    alignSelf: 'center',
    width: 44,
    height: 12,
    backgroundColor: 'rgba(201,169,110,0.4)',
    borderRadius: 1,
    zIndex: 2,
  },
  polaroidCaption: { padding: 10, paddingBottom: 12, backgroundColor: Colors.warm },
  polaroidTitle: { fontFamily: 'DMSans_500Medium', fontSize: 11, color: Colors.ink, marginBottom: 2 },
  polaroidDate: { fontFamily: 'CormorantGaramond_300Light_Italic', fontSize: 11, color: Colors.inkMedium },

  // Era selector
  eraStrip: { gap: 8, paddingBottom: 12 },
  eraBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(196,169,160,0.3)', backgroundColor: 'transparent',
  },
  eraBtnActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  eraBtnText: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: Colors.inkMedium },
  eraBtnTextActive: { color: Colors.cream },
  autoChip: { backgroundColor: Colors.sageDark, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  autoChipText: { fontFamily: 'DMSans_400Regular', fontSize: 7, color: '#fff', letterSpacing: 0.4 },

  // Preview
  previewWrap: {
    height: 160, borderRadius: 4, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 8,
  },
  previewTape: {
    position: 'absolute', top: -4, alignSelf: 'center',
    width: 44, height: 12, backgroundColor: 'rgba(201,169,110,0.35)', borderRadius: 1, zIndex: 3,
  },
  previewPhoto: { fontSize: 52, position: 'relative', zIndex: 1 },
  placedSticker1: { position: 'absolute', top: 14, right: 18, fontSize: 26, zIndex: 2 },
  placedSticker2: { position: 'absolute', bottom: 24, left: 12, fontSize: 18, zIndex: 2 },
  previewCaption: {
    position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center',
    fontFamily: 'Lora_400Regular_Italic', fontSize: 10,
    color: 'rgba(44,36,32,0.55)', zIndex: 2,
  },

  // Era info
  eraBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 10, paddingHorizontal: 12, backgroundColor: 'rgba(193,123,92,0.08)',
    borderLeftWidth: 2, borderLeftColor: Colors.sienna, marginBottom: 12,
  },
  eraBarLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10, color: Colors.sienna },
  eraBarNote: { fontFamily: 'DMSans_400Regular', fontSize: 9, color: Colors.inkMedium },

  // Categories
  catStrip: { gap: 8, paddingBottom: 12 },
  catBtn: {
    paddingVertical: 7, paddingHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(196,169,160,0.3)',
  },
  catBtnActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  catText: { fontFamily: 'DMSans_400Regular', fontSize: 11, letterSpacing: 0.6, color: Colors.inkMedium },
  catTextActive: { color: Colors.cream },

  // Sticker grid
  stickerGrid: {
    flexDirection: 'row', flexWrap: 'wrap', borderRadius: 4,
    overflow: 'hidden', backgroundColor: 'rgba(196,169,160,0.15)', gap: 1,
    marginBottom: Spacing.xl,
  },
  stickerItem: {
    width: '19.6%', backgroundColor: Colors.warm, paddingVertical: 16, paddingHorizontal: 4,
    alignItems: 'center', gap: 4, position: 'relative',
  },
  stickerItemSelected: { backgroundColor: 'rgba(193,123,92,0.1)' },
  stickerEmoji: { fontSize: 26 },
  stickerName: { fontFamily: 'DMSans_400Regular', fontSize: 7, color: Colors.inkMedium, textAlign: 'center', lineHeight: 10 },
  stickerTick: { position: 'absolute', top: 4, right: 4, fontSize: 8, color: Colors.sienna, fontFamily: 'DMSans_500Medium' },

  // Footer
  footer: { flexDirection: 'row', gap: 10 },
  outlineBtn: {
    flex: 1, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(196,169,160,0.4)',
    alignItems: 'center', borderRadius: 2,
  },
  outlineBtnText: { fontFamily: 'DMSans_400Regular', fontSize: 12, letterSpacing: 1, color: Colors.inkLight },
  filledBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: Colors.sienna,
    alignItems: 'center', borderRadius: 2,
  },
  filledBtnText: { fontFamily: 'DMSans_400Regular', fontSize: 12, letterSpacing: 1, color: '#fff' },
});
