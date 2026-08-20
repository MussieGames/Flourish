import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, Icon, InfoBox } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useJournal, useMemories } from '@/hooks/useBabyData';
import { addPendingInvite, removePendingInvite } from '@/firebase/firestore';
import { isValidEmail } from '@/lib/validation';
import { colors, fonts, radius } from '@/theme';

export default function Sharing() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeBaby, user } = useAuth();
  const { items: memories } = useMemories(activeBaby?.id);
  const { items: journal } = useJournal(activeBaby?.id);

  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const name = activeBaby?.name ?? 'your baby';
  const counts = useMemo(() => {
    const photos = memories.filter((m) => m.kind === 'photo').length;
    const videos = memories.filter((m) => m.kind === 'video').length;
    const notes = journal.length + memories.filter((m) => m.kind === 'note').length;
    return { photos, videos, notes };
  }, [memories, journal]);

  const invites = activeBaby?.pendingInvites ?? [];
  const isOwner = activeBaby?.ownerId === user?.uid;

  const sendInvite = async () => {
    if (!activeBaby || !isValidEmail(email)) {
      Alert.alert('Check the email', 'Please enter a valid email address.');
      return;
    }
    setInviting(true);
    try {
      await addPendingInvite(activeBaby.id, email);
      setEmail('');
      Alert.alert('Invitation noted', `We’ll give ${email.trim().toLowerCase()} secure access to ${name}’s story once they accept.`);
    } catch {
      Alert.alert('Hmm', 'Couldn’t send that invite right now.');
    } finally {
      setInviting(false);
    }
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
          <AppText variant="caption" color={colors.onDark40}>Only the people you choose can ever see this</AppText>
        </View>
      </View>

      {/* Album */}
      <View style={styles.album}>
        <LinearGradient colors={[colors.blush, colors.rose]} style={styles.albumCover}>
          <AppText variant="titleItalic" color={colors.ink} center>{name}&apos;s{'\n'}private album</AppText>
        </LinearGradient>
        <View style={styles.albumInfo}>
          <View style={styles.flex1}>
            <AppText variant="bodyMedium">{name}</AppText>
            <AppText variant="caption">
              {counts.photos} photos · {counts.videos} videos · {counts.notes} notes
            </AppText>
          </View>
          <Icon name="lock-closed" size={16} color={colors.sageDark} />
        </View>
      </View>

      <View style={styles.body}>
        <AppText variant="label" color={colors.inkMuted} style={styles.label}>People with access</AppText>

        <View style={styles.personRow}>
          <View style={styles.avatar}><Icon name="person" size={16} color={colors.ink} /></View>
          <View style={styles.flex1}>
            <AppText variant="bodyMedium">You{isOwner ? '' : ''}</AppText>
            <AppText variant="caption">{isOwner ? 'Owner · full access' : 'Full access'}</AppText>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.dot} />
            <AppText variant="caption" color={colors.sageDark}>Active now</AppText>
          </View>
        </View>

        {invites.map((invEmail) => (
          <View key={invEmail} style={styles.personRow}>
            <View style={styles.avatar}><Icon name="mail-outline" size={16} color={colors.ink} /></View>
            <View style={styles.flex1}>
              <AppText variant="bodyMedium" numberOfLines={1}>{invEmail}</AppText>
              <AppText variant="caption">Invited · awaiting acceptance</AppText>
            </View>
            {isOwner ? (
              <Pressable hitSlop={10} onPress={() => activeBaby && removePendingInvite(activeBaby.id, invEmail)}>
                <Icon name="close" size={18} color={colors.inkMuted} />
              </Pressable>
            ) : null}
          </View>
        ))}

        {isOwner ? (
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
          </View>
        ) : null}

        <InfoBox accent={colors.sageDark} style={styles.note}>
          <AppText variant="caption" color={colors.inkLight} style={styles.noteText}>
            Invited family get a secure, view-only link once they accept — no public sharing, ever.
            Loved-this reactions and “last viewed” are on the way.
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
  note: { marginTop: 16 },
  noteText: { lineHeight: 18 },
});
