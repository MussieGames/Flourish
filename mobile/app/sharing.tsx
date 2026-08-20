import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Icon, InfoBox } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useAppLock } from '@/context/AppLockContext';
import { useMemories } from '@/hooks/useBabyData';
import {
  claimFamilyInvite,
  confirmFamilyInvite,
  createFamilyInvite,
  revokeFamilyInvite,
  revokeFamilyMember,
  subscribeBabyInvites,
  subscribeIncomingInvites,
} from '@/firebase/firestore';
import { hasSharingAccess } from '@/lib/plans';
import { isValidEmail } from '@/lib/validation';
import { colors, fonts, radius } from '@/theme';
import type { FamilyInvite } from '@/types/models';

export default function Sharing() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, user, profile, emailVerified, isOwner } = useAuth();
  const { confirmIdentity, biometricLabel } = useAppLock();
  const { items: memories } = useMemories(activeBaby?.id);

  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [babyInvites, setBabyInvites] = useState<FamilyInvite[]>([]);
  const [incoming, setIncoming] = useState<FamilyInvite[]>([]);

  const name = activeBaby?.name ?? 'your baby';
  const sharingOn = hasSharingAccess(profile?.plan);
  const lockName = biometricLabel === 'fingerprint' ? 'your fingerprint' : biometricLabel;
  const photos = memories.filter((m) => m.kind === 'photo').length;
  const videos = memories.filter((m) => m.kind === 'video').length;

  useEffect(() => {
    if (!activeBaby?.id || !isOwner) {
      setBabyInvites([]);
      return;
    }
    return subscribeBabyInvites(activeBaby.id, setBabyInvites);
  }, [activeBaby?.id, isOwner]);

  useEffect(() => {
    if (!user?.email) {
      setIncoming([]);
      return;
    }
    return subscribeIncomingInvites(user.email, setIncoming);
  }, [user?.email]);

  const openInvites = useMemo(
    () => babyInvites.filter((i) => i.status !== 'revoked'),
    [babyInvites],
  );

  const sendInvite = async () => {
    if (!sharingOn) {
      router.push('/plan');
      return;
    }
    if (!emailVerified) {
      Alert.alert('Verify your email first', 'Invites can only be sent from a verified account.');
      return;
    }
    if (!activeBaby || !user || !isValidEmail(email)) {
      Alert.alert('Check the email', 'Please enter a valid email address.');
      return;
    }
    const clean = email.trim().toLowerCase();
    if (clean === user.email?.toLowerCase()) {
      Alert.alert('That’s you', 'Invite someone else — they must sign in as that exact email.');
      return;
    }
    const ok = await confirmIdentity(`Confirm it’s you to invite someone to ${name}’s story`);
    if (!ok) return;
    setInviting(true);
    try {
      await createFamilyInvite(activeBaby.id, user.uid, clean);
      setEmail('');
      Alert.alert(
        'Invite sent',
        `${clean} has 7 days to sign in as that email and claim it. You’ll confirm before they can see ${name}’s photos. They will never see the journal.`,
      );
    } catch {
      Alert.alert('Hmm', 'Couldn’t send that invite right now.');
    } finally {
      setInviting(false);
    }
  };

  const onClaim = async (invite: FamilyInvite) => {
    if (!user) return;
    if (!emailVerified) {
      Alert.alert('Verify your email first', 'Claiming an invite needs a verified inbox — the one on the invite.');
      return;
    }
    try {
      await claimFamilyInvite(invite.id, user.uid);
      Alert.alert('Claimed', 'Waiting for them to confirm. You’ll get view-only access to photos — never the journal.');
    } catch {
      Alert.alert('Hmm', 'Couldn’t claim that invite. It may have expired.');
    }
  };

  const onConfirm = async (invite: FamilyInvite) => {
    if (!activeBaby) return;
    const ok = await confirmIdentity(`Confirm it’s you to give ${invite.email} access`);
    if (!ok) return;
    try {
      await confirmFamilyInvite(activeBaby.id, invite);
    } catch {
      Alert.alert('Hmm', 'Couldn’t confirm that invite.');
    }
  };

  const onRevoke = async (invite: FamilyInvite) => {
    if (!activeBaby) return;
    try {
      if (invite.claimedByUid && invite.status === 'confirmed') {
        await revokeFamilyMember(activeBaby.id, invite.claimedByUid, invite.id);
      } else {
        await revokeFamilyInvite(invite.id);
      }
    } catch {
      Alert.alert('Hmm', 'Couldn’t revoke that invite.');
    }
  };

  const statusLabel = (invite: FamilyInvite) => {
    if (invite.status === 'pending') return 'Invited · 7 days to claim';
    if (invite.status === 'claimed') return 'Claimed · waiting for you to confirm';
    if (invite.status === 'confirmed') return 'View-only · never the journal';
    return 'Revoked';
  };

  return (
    <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Icon name="chevron-back" size={26} color={colors.cream} />
        </Pressable>
        <AppText variant="display" color={colors.cream}>
          Share <AppText variant="displayItalic" color={colors.rose}>privately</AppText>
        </AppText>
        <View style={styles.privateRow}>
          <Icon name="lock-closed-outline" size={11} color={colors.onDark40} />
          <AppText variant="caption" color={colors.onDark40}>View-only. Never the journal. Revoke in one tap.</AppText>
        </View>
      </View>

      <View style={styles.album}>
        <LinearGradient colors={[colors.blush, colors.rose]} style={styles.albumCover}>
          <AppText variant="titleItalic" color={colors.ink} center>{name}&apos;s{'\n'}private album</AppText>
        </LinearGradient>
        <View style={styles.albumInfo}>
          <View style={styles.flex1}>
            <AppText variant="bodyMedium">{name}</AppText>
            <AppText variant="caption">
              {photos} photos · {videos} videos
            </AppText>
          </View>
          <Icon name="lock-closed" size={16} color={colors.sageDark} />
        </View>
      </View>

      <View style={styles.body}>
        {incoming.length > 0 ? (
          <>
            <AppText variant="label" color={colors.inkMuted} style={styles.label}>Invites for you</AppText>
            {incoming.map((invite) => (
              <View key={invite.id} style={styles.personRow}>
                <View style={styles.avatar}><Icon name="mail-outline" size={16} color={colors.ink} /></View>
                <View style={styles.flex1}>
                  <AppText variant="bodyMedium">A family story</AppText>
                  <AppText variant="caption">
                    {invite.status === 'pending' ? 'Sign in as this email to claim' : 'Waiting for them to confirm'}
                  </AppText>
                </View>
                {invite.status === 'pending' ? (
                  <Pressable style={styles.smallBtn} onPress={() => onClaim(invite)}>
                    <AppText variant="label" color={colors.white} style={styles.smallLabel}>Claim</AppText>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </>
        ) : null}

        <AppText variant="label" color={colors.inkMuted} style={styles.label}>People with access</AppText>

        <View style={styles.personRow}>
          <View style={styles.avatar}><Icon name="person" size={16} color={colors.ink} /></View>
          <View style={styles.flex1}>
            <AppText variant="bodyMedium">You</AppText>
            <AppText variant="caption">{isOwner ? 'Owner · full access' : 'View-only'}</AppText>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.dot} />
            <AppText variant="caption" color={colors.sageDark}>Active now</AppText>
          </View>
        </View>

        {isOwner ? openInvites.map((invite) => (
          <View key={invite.id} style={styles.personRow}>
            <View style={styles.avatar}><Icon name="mail-outline" size={16} color={colors.ink} /></View>
            <View style={styles.flex1}>
              <AppText variant="bodyMedium" numberOfLines={1}>{invite.email}</AppText>
              <AppText variant="caption">{statusLabel(invite)}</AppText>
            </View>
            {invite.status === 'claimed' ? (
              <Pressable style={styles.smallBtn} onPress={() => onConfirm(invite)}>
                <AppText variant="label" color={colors.white} style={styles.smallLabel}>Confirm</AppText>
              </Pressable>
            ) : (
              <Pressable hitSlop={10} onPress={() => onRevoke(invite)}>
                <Icon name="close" size={18} color={colors.inkMuted} />
              </Pressable>
            )}
          </View>
        )) : null}

        {isOwner && sharingOn ? (
          <View style={styles.inviteCard}>
            <AppText variant="titleItalic" color={colors.ink} style={styles.inviteTitle}>
              Share with someone who loves {name}
            </AppText>
            <View style={styles.inviteRow}>
              <View style={styles.flex1}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="grandma@email.com"
                  placeholderTextColor={colors.inkMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.inviteInput}
                />
              </View>
            </View>
            <View style={styles.inviteBtn}>
              <Button label="Send a private invite" loading={inviting} onPress={sendInvite} />
            </View>
            <AppText variant="caption" color={colors.inkMuted} style={styles.inviteHint}>
              They must sign in as that exact email. You’ll confirm. {lockName} before send. 7 days to claim.
            </AppText>
          </View>
        ) : null}

        {isOwner && !sharingOn ? (
          <View style={styles.inviteCard}>
            <AppText variant="titleItalic" color={colors.ink} style={styles.inviteTitle}>
              Private sharing is part of Bloom
            </AppText>
            <AppText variant="caption" color={colors.inkLight} style={styles.gateBody}>
              Seedling keeps {name}’s story on this phone, for you. Bloom lets you invite the people
              who love them — view only, never the journal.
            </AppText>
            <View style={styles.inviteBtn}>
              <Button label="See Bloom" onPress={() => router.push('/plan')} />
            </View>
          </View>
        ) : null}

        <InfoBox accent={colors.sageDark} style={styles.note}>
          <AppText variant="caption" color={colors.inkLight} style={styles.noteText}>
            Invited family see photos and firsts only. The journal stays yours. You can revoke in one tap.
          </AppText>
        </InfoBox>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  flex1: { flex: 1 },
  hero: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingBottom: 22 },
  back: { marginBottom: 8 },
  privateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  album: { marginHorizontal: 20, marginTop: 16, borderRadius: radius.md, overflow: 'hidden' },
  albumCover: { aspectRatio: 16 / 7, alignItems: 'center', justifyContent: 'center' },
  albumInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.warm, padding: 14 },
  body: { padding: 20, paddingBottom: 40 },
  label: { marginBottom: 12 },
  personRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.warm, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 14, marginBottom: 10,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.blush, alignItems: 'center', justifyContent: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.sageDark },
  smallBtn: { backgroundColor: colors.sienna, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm },
  smallLabel: { letterSpacing: 0.8 },
  inviteCard: {
    borderWidth: 1, borderColor: 'rgba(196,169,160,0.4)', borderStyle: 'dashed',
    borderRadius: radius.md, padding: 16, marginTop: 6,
  },
  inviteTitle: { fontSize: 18, marginBottom: 12 },
  inviteRow: { flexDirection: 'row', gap: 8 },
  inviteInput: {
    backgroundColor: colors.warm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.body, fontSize: 14, color: colors.ink,
  },
  inviteBtn: { marginTop: 10 },
  inviteHint: { marginTop: 10, lineHeight: 18 },
  gateBody: { lineHeight: 18, marginBottom: 4 },
  note: { marginTop: 16 },
  noteText: { lineHeight: 18 },
});
