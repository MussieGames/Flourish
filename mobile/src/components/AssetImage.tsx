import React, { useEffect, useState } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../theme/tokens";
import { Text } from "./ui/Text";
import { getAssetUrl } from "../services/storage";

interface Props {
  storagePath?: string;
  /** Fallback emoji shown when there is no image. */
  fallbackEmoji?: string;
  gradient?: [string, string];
  style?: ViewStyle;
  emojiSize?: number;
}

// Tiny in-memory cache so re-renders / list scrolls don't refetch URLs.
const urlCache = new Map<string, string>();

export function AssetImage({
  storagePath,
  fallbackEmoji = "🖼️",
  gradient = ["#E8C4B0", "#C4907A"],
  style,
  emojiSize = 32,
}: Props) {
  const [url, setUrl] = useState<string | null>(
    storagePath ? urlCache.get(storagePath) ?? null : null,
  );

  useEffect(() => {
    let active = true;
    if (!storagePath) {
      setUrl(null);
      return;
    }
    const cached = urlCache.get(storagePath);
    if (cached) {
      setUrl(cached);
      return;
    }
    getAssetUrl(storagePath)
      .then((u) => {
        urlCache.set(storagePath, u);
        if (active) setUrl(u);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
  }, [storagePath]);

  if (storagePath && url) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.base, style]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, styles.center, style]}
    >
      <Text style={{ fontSize: emojiSize }}>{fallbackEmoji}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.blush, overflow: "hidden" },
  center: { alignItems: "center", justifyContent: "center" },
});
