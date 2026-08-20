import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { resolveDownloadUrl } from '@/firebase/storage';
import type { MemoryKind } from '@/types/models';
import { AppText } from './Text';

const GRADIENTS: [string, string][] = [
  ['#E8C4B0', '#C4907A'],
  ['#C5D4C0', '#A8BFA8'],
  ['#E8D5B0', '#D4B880'],
  ['#D4C4D8', '#B4A0C0'],
];

const KIND_EMOJI: Record<MemoryKind, string> = {
  photo: '📷',
  video: '🎥',
  note: '✍️',
};

export function MemoryThumb({
  storagePath,
  kind,
  index,
  height = 90,
}: {
  storagePath?: string | null;
  kind: MemoryKind;
  index: number;
  height?: number;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const gradient = GRADIENTS[index % GRADIENTS.length];

  useEffect(() => {
    let active = true;
    if (storagePath) {
      resolveDownloadUrl(storagePath)
        .then((u) => active && setUrl(u))
        .catch(() => active && setUrl(null));
    } else {
      setUrl(null);
    }
    return () => {
      active = false;
    };
  }, [storagePath]);

  if (url) {
    return <Image source={{ uri: url }} style={[styles.image, { height }]} contentFit="cover" transition={200} />;
  }

  return (
    <LinearGradient colors={gradient} style={[styles.placeholder, { height }]}>
      <View style={styles.center}>
        <AppText style={styles.emoji}>{KIND_EMOJI[kind]}</AppText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%' },
  placeholder: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 30 },
});
