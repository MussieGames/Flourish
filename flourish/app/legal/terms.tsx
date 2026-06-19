/**
 * Terms of Service — in-app screen.
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

export default function TermsOfServiceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <View style={[legal.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={legal.back}>
          <Text style={legal.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={legal.title}>Terms of <Text style={legal.titleItalic}>Service</Text></Text>
        <Text style={legal.meta}>Last updated {LAST_UPDATED}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing['2xl'], paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>

        <Para>
          By using Flourish you agree to these terms. They are written to be
          read, not buried. If something is unclear, email hello@flourish.app.
        </Para>

        <Section title="The service">
          <Para>Flourish is a private memory app for parents and caregivers. We provide tools to capture, store, and share memories of your child's early life. You must be 18 or older to create an account.</Para>
        </Section>

        <Section title="Your content">
          <Para>Everything you upload (photos, videos, journal entries) belongs to you. You grant Flourish a limited licence to store and display your content solely to provide the service. We do not claim ownership of your content and will never use it for advertising, training AI models, or any purpose other than operating the app for you.</Para>
        </Section>

        <Section title="Acceptable use">
          <Para>You agree not to upload content that is illegal, harmful, or violates anyone's rights. Flourish reserves the right to suspend accounts that violate these terms.</Para>
        </Section>

        <Section title="Subscriptions and payments">
          <Para>Bloom subscriptions (monthly at $8/month or annual at $69/year) are billed through the App Store (iOS) or Google Play (Android). Annual subscribers retain Bloom access until their period ends when cancelled — we do not offer prorated refunds except where required by law (EU, UK, and Australia have a 14-day statutory right).</Para>
          <Para>Heirloom ($79) is a one-time purchase that includes a printed book and 12 months of Bloom. The 12 months of Bloom stacks on top of any existing Bloom access — time already paid for is never lost.</Para>
          <Para>Your memories are never deleted due to subscription changes. Downgrading to Seedling retains all your data.</Para>
        </Section>

        <Section title="Data and privacy">
          <Para>Your data is governed by our Privacy Policy, which is part of these terms. We do not sell your data.</Para>
        </Section>

        <Section title="Service availability">
          <Para>We aim for 99.9% uptime but cannot guarantee uninterrupted service. We will communicate planned maintenance in advance.</Para>
        </Section>

        <Section title="Limitation of liability">
          <Para>Flourish is provided "as is". To the maximum extent permitted by law, our liability is limited to the amount you paid us in the three months preceding a claim.</Para>
        </Section>

        <Section title="Governing law">
          <Para>These terms are governed by the laws of England and Wales (or your local jurisdiction where mandatory consumer law applies).</Para>
        </Section>

        <Section title="Contact">
          <Para>For questions about these terms: hello@flourish.app</Para>
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
