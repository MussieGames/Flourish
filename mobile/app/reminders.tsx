import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BrandMark, Button, Icon, InfoBox } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useReminders } from '@/context/RemindersContext';
import { GROWTH_DISCLAIMER } from '@/data/growth';
import { colors, radius } from '@/theme';

export default function RemindersOptIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby } = useAuth();
  const { enableReminders, skipReminders } = useReminders();
  const [saving, setSaving] = useState(false);
  const name = activeBaby?.name ?? 'your baby';

  const finish = () => router.replace('/(tabs)');

  const onEnable = async () => {
    setSaving(true);
    try {
      const ok = await enableReminders();
      if (!ok) {
        Alert.alert(
          'Reminders are off for now',
          'You can turn them on any time from Profile. Flourish will never nag — just a quiet heads-up when a first is likely near.',
        );
      }
      finish();
    } finally {
      setSaving(false);
    }
  };

  const onSkip = async () => {
    await skipReminders();
    finish();
  };

  return (
    <View style={[styles.flex, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      <LinearGradient
        colors={['rgba(193,123,92,0.16)', 'transparent']}
        start={{ x: 0.8, y: 1 }}
        end={{ x: 0.2, y: 0 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.hero}>
        <BrandMark size={28} color={colors.sage} bloom />
        <AppText variant="label" color={colors.gold} style={styles.eyebrow}>
          Gentle reminders
        </AppText>
        <AppText variant="display" color={colors.cream}>
          We’ll keep the{'\n'}
          <AppText variant="displayItalic" color={colors.rose}>camera ready.</AppText>
        </AppText>
        <AppText variant="bodyLight" color={colors.onDark60} style={styles.lede}>
          A quiet heads-up a couple of weeks before {name}’s next first is likely —
          so you can catch it, not chase it.
        </AppText>
      </View>

      <View style={styles.points}>
        <Point icon="notifications-outline" title="Once, in the morning">
          Delivered at 10am. Never in the small hours. Never a checklist alarm.
        </Point>
        <Point icon="leaf-outline" title="Windows, not deadlines">
          Ages come from CDC, WHO and AAP — when many children do something, not when yours must.
        </Point>
        <Point icon="close-circle-outline" title="Off whenever you like">
          One toggle in Profile. Capturing a first cancels its reminder.
        </Point>
      </View>

      <InfoBox accent={colors.sageDark} tint="rgba(181,196,177,0.12)" style={styles.disclaimer}>
        <AppText variant="caption" color={colors.onDark45} style={styles.disclaimerText}>
          {GROWTH_DISCLAIMER}
        </AppText>
      </InfoBox>

      <View style={styles.actions}>
        <Button label="Yes — remind me" loading={saving} onPress={onEnable} />
        <Pressable onPress={onSkip} style={styles.skip}>
          <AppText variant="label" color={colors.onDark45}>Not now</AppText>
        </Pressable>
      </View>
    </View>
  );
}

function Point({
  icon,
  title,
  children,
}: {
  icon: 'notifications-outline' | 'leaf-outline' | 'close-circle-outline';
  title: string;
  children: string;
}) {
  return (
    <View style={styles.point}>
      <View style={styles.pointIcon}>
        <Icon name={icon} size={16} color={colors.sienna} />
      </View>
      <View style={styles.flex1}>
        <AppText variant="bodyMedium" color={colors.cream}>{title}</AppText>
        <AppText variant="caption" color={colors.onDark45} style={styles.pointBody}>{children}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ink, paddingHorizontal: 24 },
  flex1: { flex: 1 },
  hero: { paddingTop: 12 },
  eyebrow: { marginTop: 18, marginBottom: 10 },
  lede: { marginTop: 12, lineHeight: 22 },
  points: { marginTop: 28, gap: 14 },
  point: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pointIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(193,123,92,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pointBody: { marginTop: 3, lineHeight: 18 },
  disclaimer: { marginTop: 24 },
  disclaimerText: { lineHeight: 18 },
  actions: { marginTop: 'auto', paddingTop: 20, gap: 4 },
  skip: { alignItems: 'center', paddingVertical: 14 },
});
