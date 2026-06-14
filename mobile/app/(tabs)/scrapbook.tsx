import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, EmptyState, Hero } from '@/components';
import { MemoryThumb } from '@/components/MemoryThumb';
import { useAuth } from '@/context/AuthContext';
import { useMemories } from '@/hooks/useBabyData';
import { formatRelative, tsToDate } from '@/lib/format';
import { colors, radius } from '@/theme';

export default function Scrapbook() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby } = useAuth();
  const { items: memories, loading } = useMemories(activeBaby?.id);

  return (
    <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
      <Hero paddingTop={insets.top + 20} glow="rgba(181,196,177,0.16)">
        <AppText variant="label" color={colors.sage}>
          The scrapbook
        </AppText>
        <AppText variant="display" color={colors.cream}>
          {activeBaby?.name ?? 'Baby'}&apos;s{' '}
          <AppText variant="displayItalic" color={colors.rose}>
            story
          </AppText>
        </AppText>
        <AppText variant="caption" color={colors.onDark45} style={styles.sub}>
          {memories.length} {memories.length === 1 ? 'memory' : 'memories'} kept safe
        </AppText>
      </Hero>

      <Pressable style={styles.stickerCta} onPress={() => router.push('/stickers')}>
        <Ionicons name="sparkles-outline" size={18} color={colors.sienna} />
        <AppText variant="bodyMedium" color={colors.ink} style={styles.flex1}>
          Decorate a page with stickers
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={colors.inkMuted} />
      </Pressable>

      <View style={styles.body}>
        {memories.length === 0 && !loading ? (
          <EmptyState
            emoji="📖"
            title="The first page is waiting"
            subtitle="Capture a photo, video or journal entry and it will appear here, kept private and safe."
          />
        ) : (
          <View style={styles.grid}>
            {memories.map((mem, i) => (
              <View key={mem.id} style={styles.card}>
                <MemoryThumb storagePath={mem.storagePath} kind={mem.kind} index={i} height={120} />
                <View style={styles.meta}>
                  <AppText variant="bodyMedium" numberOfLines={1}>
                    {mem.title}
                  </AppText>
                  <AppText variant="caption">{formatRelative(tsToDate(mem.createdAt))}</AppText>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  sub: { marginTop: 6 },
  stickerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.warm,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: { padding: 20, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    width: '48.5%',
    backgroundColor: colors.warm,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  meta: { paddingHorizontal: 12, paddingVertical: 10 },
});
