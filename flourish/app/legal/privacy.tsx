/**
 * Privacy Policy — in-app screen.
 * Must be accessible from signup and profile without requiring a browser.
 * Required for App Store submission.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';

const LAST_UPDATED = '18 June 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={legal.section}>
      <Text style={legal.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <Text style={legal.para}>{children}</Text>;
}

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <View style={[legal.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={legal.back}>
          <Text style={legal.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={legal.title}>Privacy <Text style={legal.titleItalic}>Policy</Text></Text>
        <Text style={legal.meta}>Last updated {LAST_UPDATED}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing['2xl'], paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>

        <Para>
          Flourish is built on a simple promise: your family's memories belong to you.
          We do not sell, share, or advertise with your data — ever. This policy explains
          exactly what we collect, why, and how you can delete it.
        </Para>

        <Section title="What we collect">
          <Para>• Your name and email address (to create your account)</Para>
          <Para>• Your baby's name, birth date, and optional photo</Para>
          <Para>• Photos, videos, and journal entries you add to the app</Para>
          <Para>• Milestone records and calendar events you create</Para>
          <Para>• Device push notification tokens (if you grant permission)</Para>
          <Para>• Anonymous usage events (which screens you visit, which features you use) — never linked to your name or email</Para>
        </Section>

        <Section title="What we never collect">
          <Para>• We never access your device's camera or photo library without your explicit permission</Para>
          <Para>• We never read messages, contacts, or location data</Para>
          <Para>• We never use your data for advertising</Para>
          <Para>• We never sell data to third parties</Para>
        </Section>

        <Section title="How we use your data">
          <Para>Your data is used solely to provide the Flourish service: storing your memories, tracking milestones, and sending notifications you have opted into. We use Firebase (Google Cloud) for secure storage and authentication. All data is encrypted in transit (TLS) and at rest.</Para>
        </Section>

        <Section title="Children's data (COPPA & GDPR)">
          <Para>Flourish is directed at parents and caregivers aged 18 and over, not children. When you add your baby's information, you are providing it as a parent or guardian and consenting to its storage on your child's behalf. We store baby data (name, birth date, photos) solely to provide the Flourish service to you.</Para>
          <Para>We comply with the Children's Online Privacy Protection Act (COPPA) in the US and the General Data Protection Regulation (GDPR) in the EU and UK.</Para>
        </Section>

        <Section title="Your rights">
          <Para>You can delete your account at any time from Settings → Account → Delete account. This permanently deletes all your data — babies, memories, journal entries, and your account — within 30 days. We do not keep backups of deleted accounts.</Para>
          <Para>EU and UK users have the right to access, correct, or export their data. Contact us at privacy@flourish.app.</Para>
        </Section>

        <Section title="Data retention">
          <Para>Your data is retained as long as your account is active. When you delete your account, all data is deleted. Inactive Seedling accounts (no login for 24 months) receive an email warning before any data is removed.</Para>
        </Section>

        <Section title="Contact">
          <Para>For privacy questions or data requests: privacy@flourish.app</Para>
        </Section>

      </ScrollView>
    </View>
  );
}

const legal = StyleSheet.create({
  header: {
    backgroundColor: Colors.warm, paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl, borderBottomWidth: 1,
    borderBottomColor: 'rgba(196,169,160,0.2)',
  },
  back: { marginBottom: 12 },
  backText: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.lg, color: Colors.sienna },
  title: { fontFamily: 'CormorantGaramond_300Light', fontSize: 28, color: Colors.ink, marginBottom: 4 },
  titleItalic: { fontFamily: 'CormorantGaramond_300Light_Italic', color: Colors.sienna },
  meta: { fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.xs, color: Colors.inkMedium },
  section: { marginTop: Spacing['2xl'] },
  sectionTitle: {
    fontFamily: 'DMSans_500Medium', fontSize: Typography.sizes.md,
    color: Colors.ink, marginBottom: Spacing.sm,
  },
  para: {
    fontFamily: 'DMSans_400Regular', fontSize: Typography.sizes.sm,
    color: Colors.inkLight, lineHeight: 22, marginBottom: Spacing.sm,
  },
});
