import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { addMemory } from '@/firebase/firestore';
import { ERAS, eraForAgeYears, type EraId } from '@/data/stickers';
import { ageInYears } from '@/lib/age';
import { colors, fonts, radius } from '@/theme';

export default function Stickers() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, user } = useAuth();

  const autoEra = useMemo(() => eraForAgeYears(ageInYears(activeBaby?.birthDate)), [activeBaby?.birthDate]);
  const [eraId, setEraId] = useState<EraId>(autoEra.id);
  const [activeCat, setActiveCat] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const era = ERAS.find((e) => e.id === eraId) ?? autoEra;

  const toggle = (emoji: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(emoji)) next.delete(emoji);
      else next.add(emoji);
      return next;
    });
  };

  const save = async () => {
    if (selected.size === 0) {
      Alert.alert('Pick a sticker', 'Tap a few stickers to add them to the page first.');
      return;
    }
    if (!activeBaby || !user) {
      router.back();
      return;
    }
    setSaving(true);
    try {
      await addMemory(activeBaby.id, user.uid, {
        kind: 'note',
        title: 'Decorated a page',
        caption: `${era.tab} stickers: ${Array.from(selected).join(' ')}`,
      });
      router.back();
    } catch {
      Alert.alert('Hmm', 'Couldn’t save that right now.');
    } finally {
      setSaving(false);
    }
  };

  const placed = Array.from(selected).slice(0, 4);

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <AppText variant="title" style={styles.headerTitle}>
          Add a{' '}
          <AppText variant="titleItalic" color={colors.sienna}>
            sticker
          </AppText>
        </AppText>
        <AppText variant="caption">Grows with {activeBaby?.name ?? 'your child'} · Tap to place</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Era selector */}
        <AppText variant="label" style={styles.eraLabel}>
          {activeBaby?.name ?? 'Their'} age era
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eraRow}>
          {ERAS.map((e) => {
            const active = e.id === eraId;
            return (
              <Pressable
                key={e.id}
                onPress={() => {
                  setEraId(e.id);
                  setActiveCat(0);
                }}
                style={[styles.eraChip, active && { backgroundColor: colors.ink, borderColor: e.accent }]}
              >
                <AppText variant="caption" color={active ? colors.cream : colors.inkMuted}>
                  {e.tab}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Preview */}
        <View style={styles.preview}>
          <LinearGradient colors={era.gradient} style={StyleSheet.absoluteFill} />
          <View style={styles.tape} />
          <AppText style={styles.previewPhoto}>{era.preview}</AppText>
          {placed.map((emoji, i) => (
            <AppText
              key={`${emoji}-${i}`}
              style={[styles.placedSticker, PLACED_POSITIONS[i % PLACED_POSITIONS.length]]}
            >
              {emoji}
            </AppText>
          ))}
          <AppText style={styles.caption}>{era.caption}</AppText>
        </View>

        {/* Era badge */}
        <View style={[styles.eraBadge, { borderLeftColor: era.accent }]}>
          <AppText variant="caption" color={era.accent}>
            {era.label}
          </AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            {era.id === autoEra.id ? 'Auto-selected ✓' : era.note}
          </AppText>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
          {era.categories.map((cat, i) => {
            const active = i === activeCat;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCat(i)}
                style={[styles.cat, active && styles.catActive]}
              >
                <AppText variant="caption" color={active ? colors.cream : colors.inkMuted}>
                  {cat}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Sticker grid */}
        <View style={styles.grid}>
          {era.stickers.map((s) => {
            const isSel = selected.has(s.emoji);
            return (
              <Pressable key={s.name} onPress={() => toggle(s.emoji)} style={[styles.stickerItem, isSel && styles.stickerSelected]}>
                {isSel ? (
                  <Ionicons name="checkmark" size={12} color={colors.sienna} style={styles.check} />
                ) : null}
                <AppText style={styles.stickerEmoji}>{s.emoji}</AppText>
                <AppText style={styles.stickerName}>{s.name}</AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.flex1}>
          <Button label="Clear all" variant="outline" onPress={() => setSelected(new Set())} />
        </View>
        <View style={styles.flex1}>
          <Button label="Save to page →" loading={saving} onPress={save} />
        </View>
      </View>
    </View>
  );
}

const PLACED_POSITIONS = [
  { top: 16, right: 24 },
  { bottom: 36, left: 18 },
  { top: 40, left: 28 },
  { bottom: 24, right: 30 },
];

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { marginTop: 10 },
  scroll: { paddingBottom: 20 },
  eraLabel: { marginTop: 16, marginLeft: 16, marginBottom: 8 },
  eraRow: { gap: 6, paddingHorizontal: 16 },
  eraChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    marginHorizontal: 16,
    marginTop: 10,
    height: 180,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tape: {
    position: 'absolute',
    top: -4,
    width: 48,
    height: 14,
    backgroundColor: 'rgba(201,169,110,0.5)',
    borderRadius: 1,
  },
  previewPhoto: { fontSize: 56 },
  placedSticker: { position: 'absolute', fontSize: 28 },
  caption: {
    position: 'absolute',
    bottom: 12,
    fontFamily: fonts.serifItalic,
    fontSize: 12,
    color: 'rgba(44,36,32,0.6)',
  },
  eraBadge: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(193,123,92,0.08)',
    borderLeftWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cats: { gap: 8, paddingHorizontal: 16, paddingTop: 16 },
  cat: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  catActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(196,169,160,0.15)',
    gap: 1,
  },
  stickerItem: {
    width: '19.6%',
    aspectRatio: 0.9,
    backgroundColor: colors.warm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stickerSelected: { backgroundColor: 'rgba(193,123,92,0.1)' },
  check: { position: 'absolute', top: 4, right: 4 },
  stickerEmoji: { fontSize: 24 },
  stickerName: { fontSize: 8, color: colors.inkMuted },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cream,
  },
});
