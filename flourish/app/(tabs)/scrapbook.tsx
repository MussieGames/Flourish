/**
 * Scrapbook / Stickers screen — age-adaptive sticker selection.
 */
import React, { useState } from 'react';
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
import { useBabyContext } from '../../src/contexts/BabyContext';
import { useToast } from '../../src/hooks/useToast';
import { STICKER_ERAS } from '../../src/constants/stickers';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import type { BabyEra } from '../../src/types';

const ERA_BUTTONS: { id: BabyEra; label: string }[] = [
  { id: 'baby', label: '🍼 Baby' },
  { id: 'little', label: '🎒 Little One' },
  { id: 'growing', label: '⚽ Growing Up' },
  { id: 'teen', label: '🎵 Teen' },
];

export default function ScrapbookScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, ageInfo } = useBabyContext();
  const { showToast, ToastView } = useToast();

  const currentEra = (ageInfo?.era ?? 'baby') as BabyEra;
  const [selectedEra, setSelectedEra] = useState<BabyEra>(currentEra);
  const [selectedSticker, setSelectedSticker] = useState<number | null>(0);
  const [selectedCat, setSelectedCat] = useState(0);

  const eraData = STICKER_ERAS[selectedEra];

  const handleSave = () => {
    const sticker = eraData.stickers[selectedSticker ?? 0];
    showToast(`${sticker?.emoji ?? '⭐'} added to your page`, 'Tap a memory to view your scrapbook.');
  };

  return (
  <View style={{ flex: 1 }}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Add a <Text style={styles.headerTitleItalic}>sticker</Text>
        </Text>
        <Text style={styles.headerHint}>
          Grows with {activeBaby?.name ?? 'your child'} · Tap to select
        </Text>
      </View>

      {/* Era selector */}
      <View style={styles.eraSection}>
        <EyebrowLabel style={{ marginHorizontal: Spacing.xl }}>
          {`${activeBaby?.name ?? 'Child'}'s age era`}
        </EyebrowLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eraStrip}
        >
          {ERA_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.id}
              style={[
                styles.eraBtn,
                selectedEra === btn.id && styles.eraBtnActive,
              ]}
              onPress={() => {
                setSelectedEra(btn.id);
                setSelectedSticker(0);
                setSelectedCat(0);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.eraBtnText,
                  selectedEra === btn.id && styles.eraBtnTextActive,
                ]}
              >
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
      </View>

      {/* Preview */}
      <View style={styles.previewWrap}>
        <LinearGradient
          colors={['#E8C4B0', '#C4907A']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.tape} />
        <Text style={styles.previewPhoto}>{eraData.preview}</Text>
        <Text style={styles.placedSticker1}>
          {selectedSticker !== null
            ? eraData.stickers[selectedSticker]?.emoji
            : eraData.s1}
        </Text>
        <Text style={styles.placedSticker2}>{eraData.s2}</Text>
        <Text style={styles.previewCaption}>{eraData.caption}</Text>
      </View>

      {/* Era label */}
      <View style={styles.eraLabel}>
        <Text style={styles.eraLabelText}>{eraData.label}</Text>
        <Text style={styles.eraLabelNote}>
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
            <Text
              style={[
                styles.catText,
                selectedCat === i && styles.catTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sticker grid */}
      <View style={styles.grid}>
        {eraData.stickers.map((sticker, i) => (
          <TouchableOpacity
            key={`${sticker.emoji}-${i}`}
            style={[
              styles.gridItem,
              selectedSticker === i && styles.gridItemSelected,
            ]}
            onPress={() => setSelectedSticker(i)}
            activeOpacity={0.8}
          >
            <Text style={styles.gridEmoji}>{sticker.emoji}</Text>
            <Text style={styles.gridName}>{sticker.name}</Text>
            {selectedSticker === i && (
              <Text style={styles.gridTick}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => setSelectedSticker(null)}
          activeOpacity={0.8}
        >
          <Text style={styles.outlineBtnText}>CLEAR ALL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filledBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.filledBtnText}>SAVE TO PAGE →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    {ToastView}
  </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },

  header: {
    backgroundColor: Colors.warm,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,169,160,0.2)',
  },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 24, color: Colors.ink },
  headerTitle: {
    fontFamily: 'CormorantGaramond_300Light',
    fontSize: 28,
    color: Colors.ink,
    marginBottom: 4,
  },
  headerTitleItalic: {
    fontFamily: 'CormorantGaramond_300Light_Italic',
    color: Colors.sienna,
  },
  headerHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.xs,
    color: Colors.inkMedium,
  },

  eraSection: { paddingVertical: Spacing.xl },
  eraStrip: { gap: 8, paddingHorizontal: Spacing.xl },
  eraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.3)',
    backgroundColor: 'transparent',
  },
  eraBtnActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  eraBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.inkMedium,
  },
  eraBtnTextActive: { color: Colors.cream },
  autoChip: {
    backgroundColor: Colors.sienna,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  autoChipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 7,
    color: '#fff',
    letterSpacing: 0.4,
  },

  // Preview
  previewWrap: {
    marginHorizontal: Spacing.xl,
    height: 180,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tape: {
    position: 'absolute',
    top: -4,
    alignSelf: 'center',
    width: 48,
    height: 14,
    backgroundColor: 'rgba(201,169,110,0.35)',
    borderRadius: 1,
    zIndex: 3,
  },
  previewPhoto: { fontSize: 56, position: 'relative', zIndex: 1 },
  placedSticker1: {
    position: 'absolute',
    top: 16,
    right: 20,
    fontSize: 28,
    zIndex: 2,
  },
  placedSticker2: {
    position: 'absolute',
    bottom: 28,
    left: 14,
    fontSize: 20,
    zIndex: 2,
  },
  previewCaption: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 11,
    color: 'rgba(44,36,32,0.55)',
    zIndex: 2,
  },

  // Era label bar
  eraLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    padding: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(193,123,92,0.08)',
    borderLeftWidth: 2,
    borderLeftColor: Colors.sienna,
  },
  eraLabelText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: Colors.sienna,
  },
  eraLabelNote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    color: Colors.inkMedium,
  },

  // Categories
  catStrip: { gap: 8, paddingHorizontal: Spacing.xl, paddingVertical: 12 },
  catBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.3)',
  },
  catBtnActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  catText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    letterSpacing: 0.6,
    color: Colors.inkMedium,
  },
  catTextActive: { color: Colors.cream },

  // Sticker grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: Spacing.xl,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(196,169,160,0.15)',
    gap: 1,
  },
  gridItem: {
    width: '19.6%',
    backgroundColor: Colors.warm,
    paddingVertical: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  gridItemSelected: { backgroundColor: 'rgba(193,123,92,0.1)' },
  gridEmoji: { fontSize: 26 },
  gridName: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 8,
    color: Colors.inkMedium,
    textAlign: 'center',
    lineHeight: 12,
  },
  gridTick: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 8,
    color: Colors.sienna,
    fontFamily: 'DMSans_500Medium',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  outlineBtn: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(196,169,160,0.4)',
    alignItems: 'center',
    borderRadius: 2,
  },
  outlineBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    letterSpacing: 1,
    color: Colors.inkLight,
  },
  filledBtn: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: Colors.sienna,
    alignItems: 'center',
    borderRadius: 2,
  },
  filledBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    letterSpacing: 1,
    color: '#fff',
  },
});
