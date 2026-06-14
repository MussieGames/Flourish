import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Button, Text } from "../src/components/ui";
import { colors, radius } from "../src/theme/tokens";
import { fonts } from "../src/theme/typography";
import { useChild } from "../src/context/ChildContext";
import { computeAge } from "../src/lib/date";
import { haptics } from "../src/lib/haptics";
import {
  ERA_ORDER,
  STICKER_ERAS,
  eraForAgeYears,
  type EraKey,
} from "../src/data/stickerEras";

export default function Stickers() {
  const router = useRouter();
  const { activeChild } = useChild();

  const age = useMemo(() => computeAge(activeChild?.bornAt), [activeChild?.bornAt]);
  const autoEra = useMemo<EraKey>(
    () => eraForAgeYears(age?.years ?? 0),
    [age?.years],
  );

  const [era, setEra] = useState<EraKey>(autoEra);
  const [activeCat, setActiveCat] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const data = STICKER_ERAS[era];
  const firstName = activeChild?.name.split(" ")[0] ?? "your little one";
  const isAuto = era === autoEra;

  function toggle(name: string) {
    haptics.tap();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </Pressable>
          <Text variant="heading" style={styles.title}>
            Add a{" "}
            <Text variant="heading" italic color={colors.sienna}>
              sticker
            </Text>
          </Text>
          <Text variant="caption" color={colors.inkMuted}>
            Grows with {firstName} · Tap to place
          </Text>
        </View>

        <View style={styles.eraSection}>
          <Text variant="caption" color={colors.sienna} style={styles.eraTitle}>
            {firstName.toUpperCase()}&apos;S AGE ERA
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eraTabs}>
            {ERA_ORDER.map((k) => {
              const selectedEra = k === era;
              return (
                <Pressable
                  key={k}
                  onPress={() => {
                    haptics.tap();
                    setEra(k);
                    setActiveCat(0);
                  }}
                  style={[
                    styles.eraTab,
                    selectedEra && {
                      backgroundColor: colors.ink,
                      borderColor: STICKER_ERAS[k].accent,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.eraTabText,
                      { color: selectedEra ? colors.cream : colors.inkMuted },
                    ]}
                  >
                    {STICKER_ERAS[k].tab}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.preview}>
          <LinearGradient
            colors={data.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { opacity: 0.4 }]}
          />
          <View style={styles.tape} />
          <Text style={styles.previewPhoto}>{data.preview}</Text>
          <Text style={[styles.placed, { top: 16, right: 24 }]}>
            {data.previewStickers[0]}
          </Text>
          <Text style={[styles.placed, { bottom: 30, left: 18, fontSize: 22 }]}>
            {data.previewStickers[1]}
          </Text>
          <Text style={styles.caption}>{data.caption}</Text>
        </View>

        <View style={[styles.eraLabel, { borderLeftColor: data.accent }]}>
          <Text style={[styles.eraLabelText, { color: data.accent }]}>
            {data.label}
          </Text>
          <Text variant="caption" color={colors.inkMuted}>
            {isAuto ? "Auto-selected ✓" : data.note}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
          {data.categories.map((c, i) => (
            <Pressable
              key={c}
              onPress={() => {
                haptics.tap();
                setActiveCat(i);
              }}
              style={[styles.cat, activeCat === i && styles.catActive]}
            >
              <Text
                style={[
                  styles.catText,
                  { color: activeCat === i ? colors.cream : colors.inkMuted },
                ]}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {data.stickers.map((s) => {
            const isSel = selected.has(s.name);
            return (
              <Pressable
                key={s.name}
                style={[styles.item, isSel && styles.itemSel]}
                onPress={() => toggle(s.name)}
              >
                {isSel ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color={colors.sienna}
                    style={styles.itemCheck}
                  />
                ) : null}
                <Text style={styles.itemEmoji}>{s.emoji}</Text>
                <Text style={styles.itemName}>{s.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            label="Clear all"
            variant="outline"
            onPress={() => {
              haptics.tap();
              setSelected(new Set());
            }}
            style={styles.footerBtn}
          />
          <Button
            label={`Save ${selected.size || ""} →`.replace("  ", " ")}
            onPress={() => {
              haptics.success();
              router.back();
            }}
            style={styles.footerBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  scroll: { paddingBottom: 32 },
  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: colors.warm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  back: { marginBottom: 8 },
  title: { fontSize: 28, marginBottom: 4 },
  eraSection: { paddingHorizontal: 20, paddingTop: 16 },
  eraTitle: { letterSpacing: 1.6, marginBottom: 8 },
  eraTabs: { gap: 6, paddingRight: 20 },
  eraTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  eraTabText: { fontFamily: fonts.sans, fontSize: 11 },
  preview: {
    marginHorizontal: 20,
    marginTop: 12,
    height: 180,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.warm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tape: {
    position: "absolute",
    top: -4,
    alignSelf: "center",
    width: 48,
    height: 14,
    backgroundColor: "rgba(201,169,110,0.35)",
    borderRadius: 1,
  },
  previewPhoto: { fontSize: 56 },
  placed: { position: "absolute", fontSize: 28 },
  caption: {
    position: "absolute",
    bottom: 12,
    fontFamily: fonts.loraItalic,
    fontSize: 11,
    color: "rgba(44,36,32,0.55)",
  },
  eraLabel: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(193,123,92,0.08)",
    borderLeftWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eraLabelText: { fontFamily: fonts.sans, fontSize: 10 },
  cats: { gap: 8, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  cat: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
  },
  catActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  catText: { fontFamily: fonts.sans, fontSize: 11 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: colors.warm,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  item: {
    width: "20%",
    backgroundColor: colors.warm,
    paddingVertical: 16,
    alignItems: "center",
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  itemSel: { backgroundColor: colors.siennaTint },
  itemCheck: { position: "absolute", top: 4, right: 4 },
  itemEmoji: { fontSize: 26 },
  itemName: { fontFamily: fonts.sans, fontSize: 8, color: colors.inkMuted, textAlign: "center" },
  footer: { flexDirection: "row", gap: 10, paddingHorizontal: 24, paddingTop: 20 },
  footerBtn: { flex: 1 },
});
