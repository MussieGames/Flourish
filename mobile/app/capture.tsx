import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import {
  Button,
  Card,
  Eyebrow,
  Text,
  TextField,
} from "../src/components/ui";
import { colors, radius } from "../src/theme/tokens";
import { fonts } from "../src/theme/typography";
import { useAuth } from "../src/context/AuthContext";
import { useChild } from "../src/context/ChildContext";
import { uploadChildAsset } from "../src/services/storage";
import { createMemory } from "../src/services/memories";
import { createEvent } from "../src/services/events";
import { TagInput } from "../src/components/TagInput";
import { toDateKey } from "../src/lib/date";
import { haptics } from "../src/lib/haptics";
import { LIMITS } from "../src/lib/validation";

interface PickedAsset {
  uri: string;
  mimeType: string;
}

export default function Capture() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind = params.kind === "video" ? "video" : "photo";
  const { user } = useAuth();
  const { activeChild } = useChild();

  const [asset, setAsset] = useState<PickedAsset | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaTypes: ImagePicker.MediaType[] =
    kind === "video" ? ["videos"] : ["images"];

  async function pick(fromCamera: boolean) {
    setError(null);
    try {
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError(
          fromCamera
            ? "Camera permission is needed to take a photo."
            : "Photo library permission is needed.",
        );
        return;
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes,
            quality: 0.85,
            videoMaxDuration: 60,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes,
            quality: 0.85,
          });

      if (!result.canceled && result.assets[0]) {
        const a = result.assets[0];
        setAsset({
          uri: a.uri,
          mimeType:
            a.mimeType ?? (kind === "video" ? "video/mp4" : "image/jpeg"),
        });
        haptics.tap();
      }
    } catch {
      setError("Could not open the camera or library.");
    }
  }

  async function save() {
    if (!user || !activeChild) return;
    if (!asset) {
      setError("Add a photo or video first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { storagePath } = await uploadChildAsset(
        activeChild.id,
        user.uid,
        asset.uri,
        asset.mimeType,
      );
      const now = new Date();
      await createMemory(user.uid, activeChild.id, {
        kind,
        title: title || (kind === "video" ? "A little video" : "A new memory"),
        caption,
        storagePath,
        tags,
        takenAt: now,
      });
      await createEvent(user.uid, activeChild.id, {
        type: "memory",
        title: title || "Memory saved",
        date: toDateKey(now),
      }).catch(() => {});
      haptics.success();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      haptics.warning();
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.ink} />
          </Pressable>
          <Eyebrow>{kind === "video" ? "New video" : "New photo"}</Eyebrow>
          <View style={{ width: 26 }} />
        </View>

        <Text variant="title" style={styles.title}>
          Capture a{" "}
          <Text variant="title" italic color={colors.sienna}>
            moment.
          </Text>
        </Text>

        {asset ? (
          <View style={styles.preview}>
            {kind === "photo" ? (
              <Image
                source={{ uri: asset.uri }}
                style={styles.previewImg}
                contentFit="cover"
              />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Text style={{ fontSize: 48 }}>🎥</Text>
                <Text variant="bodyMuted">Video selected</Text>
              </View>
            )}
            <Pressable
              style={styles.changeBtn}
              onPress={() => setAsset(null)}
            >
              <Text variant="caption" color={colors.white}>
                Change
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.pickRow}>
            <Pressable style={styles.pickCard} onPress={() => pick(true)}>
              <Ionicons name="camera-outline" size={28} color={colors.sienna} />
              <Text variant="caption">Take {kind}</Text>
            </Pressable>
            <Pressable style={styles.pickCard} onPress={() => pick(false)}>
              <Ionicons name="images-outline" size={28} color={colors.sienna} />
              <Text variant="caption">From library</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.fields}>
          <TextField
            placeholder="Give it a title…"
            value={title}
            onChangeText={setTitle}
            maxLength={LIMITS.memoryTitle.max}
          />
          <TextField
            placeholder="Add a caption (optional)"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={LIMITS.caption.max}
            style={styles.multiline}
          />
          <TagInput tags={tags} onChange={setTags} />
        </View>

        {error ? (
          <Text variant="caption" color={colors.sienna} style={styles.error}>
            {error}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Button
            label="Cancel"
            variant="outline"
            onPress={() => router.back()}
            style={styles.footerBtn}
          />
          <Button
            label="Save memory →"
            onPress={save}
            loading={busy}
            disabled={!asset}
            style={styles.footerBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 24, paddingTop: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 28, marginBottom: 20 },
  preview: {
    height: 220,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.blush,
    marginBottom: 20,
  },
  previewImg: { width: "100%", height: "100%" },
  videoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  changeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(44,36,32,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  pickRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  pickCard: {
    flex: 1,
    paddingVertical: 28,
    backgroundColor: colors.warm,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.hairlineStrong,
    borderRadius: radius.md,
    alignItems: "center",
    gap: 10,
  },
  fields: { gap: 14 },
  multiline: { minHeight: 70, textAlignVertical: "top", fontFamily: fonts.sans, fontSize: 15 },
  error: { marginTop: 14 },
  footer: { flexDirection: "row", gap: 10, marginTop: 24 },
  footerBtn: { flex: 1 },
});
