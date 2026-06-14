import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { BodyText, Card, Eyebrow, Field, FlourishButton, GradientCard, SerifTitle } from "@/components/ui";
import { useAuth } from "@/auth/AuthProvider";
import { calendarEvents, demoChild, eraData, firsts, recentMemories } from "@/data/demo";
import { createChildProfile, logout, saveMemory, uploadMemoryAsset } from "@/services/flourishData";
import { setAppLockEnabled } from "@/services/secureDevice";
import { colors, fontFamily, shadow, spacing } from "@/theme";
import { AppScreen, ChildProfile, StickerEra } from "@/types";

const screens: Array<{ id: AppScreen; label: string; icon: string }> = [
  { id: "welcome", label: "Welcome", icon: "🌿" },
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "stickers", label: "Stickers", icon: "⭐" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "plan", label: "Plan", icon: "🪴" },
  { id: "milestone", label: "Moment", icon: "🎉" },
  { id: "journal", label: "Journal", icon: "📖" },
];

export function MainApp({ previewMode = false }: { previewMode?: boolean }) {
  const { user } = useAuth();
  const [activeScreen, setActiveScreen] = useState<AppScreen>("welcome");
  const [child, setChild] = useState<ChildProfile>(demoChild);
  const [babyName, setBabyName] = useState(demoChild.name);
  const [appLock, setAppLock] = useState(false);

  async function saveChild() {
    try {
      if (previewMode) {
        setChild({ ...demoChild, name: babyName.trim() || demoChild.name });
      } else {
        setChild(await createChildProfile({ name: babyName }));
      }
      setActiveScreen("dashboard");
    } catch (error) {
      Alert.alert("Could not save profile", error instanceof Error ? error.message : "Please try again.");
    }
  }

  async function captureMemory(kind: "photo" | "video") {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Choose a photo or video only when you want to add it to Flourish.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: kind === "photo" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        quality: 0.86,
        allowsEditing: false,
        exif: false,
      });

      if (result.canceled) {
        return;
      }

      if (previewMode) {
        Alert.alert("Preview saved locally", "Connect Firebase to securely sync memories across devices.");
        return;
      }

      const uploaded = await uploadMemoryAsset({ childId: child.id, asset: result.assets[0] });
      await saveMemory({
        childId: child.id,
        kind,
        title: kind === "photo" ? "New photo memory" : "New video memory",
        mediaPath: uploaded.storagePath,
        occurredAtIso: new Date().toISOString(),
        tags: ["captured"],
      });
      Alert.alert("Saved", "This memory is now in your private scrapbook.");
    } catch (error) {
      Alert.alert("Could not capture memory", error instanceof Error ? error.message : "Please try again.");
    }
  }

  async function toggleAppLock(value: boolean) {
    setAppLock(value);
    await setAppLockEnabled(value);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.logo}>Flourish</Text>
          <Text style={styles.headerSub}>{previewMode ? "Secure design preview" : user?.email}</Text>
        </View>
        {!previewMode ? (
          <Pressable accessibilityRole="button" onPress={logout} style={styles.headerAction}>
            <Text style={styles.headerActionText}>Sign out</Text>
          </Pressable>
        ) : null}
      </View>

      {previewMode ? (
        <View style={styles.previewBanner}>
          <Text style={styles.previewBannerText}>
            Firebase env values are missing. This preview does not upload data.
          </Text>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {screens.map((screen) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeScreen === screen.id }}
            key={screen.id}
            onPress={() => setActiveScreen(screen.id)}
            style={[styles.tab, activeScreen === screen.id && styles.tabActive]}
          >
            <Text style={styles.tabIcon}>{screen.icon}</Text>
            <Text style={[styles.tabText, activeScreen === screen.id && styles.tabTextActive]}>{screen.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {activeScreen === "welcome" ? (
        <WelcomeScreen babyName={babyName} onChangeBabyName={setBabyName} onSave={saveChild} />
      ) : null}
      {activeScreen === "dashboard" ? (
        <DashboardScreen childName={child.name} onCapture={captureMemory} onMilestone={() => setActiveScreen("milestone")} />
      ) : null}
      {activeScreen === "stickers" ? <StickersScreen childName={child.name} /> : null}
      {activeScreen === "calendar" ? <CalendarScreen childName={child.name} /> : null}
      {activeScreen === "plan" ? (
        <PlanScreen appLock={appLock} onToggleAppLock={toggleAppLock} />
      ) : null}
      {activeScreen === "milestone" ? <MilestoneScreen childName={child.name} /> : null}
      {activeScreen === "journal" ? <JournalScreen childName={child.name} /> : null}
    </SafeAreaView>
  );
}

function WelcomeScreen({
  babyName,
  onChangeBabyName,
  onSave,
}: {
  babyName: string;
  onChangeBabyName: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <LinearGradient colors={[colors.ink, "#3D2820"]} style={styles.darkHero}>
        <Text style={styles.heroEmoji}>🌿</Text>
        <SerifTitle light size={40}>
          Welcome to{"\n"}Flourish.
        </SerifTitle>
        <BodyText light>
          You just did something extraordinary. In between the feeds, the tears, and the love that does not fit into
          words, Flourish helps you catch every moment before it slips by.
        </BodyText>
      </LinearGradient>
      <View style={styles.padded}>
        <Eyebrow>Let&apos;s begin</Eyebrow>
        <SerifTitle size={30}>What&apos;s your little one&apos;s name?</SerifTitle>
        <View style={{ height: spacing.lg }} />
        <Field icon="🍼" onChangeText={onChangeBabyName} placeholder="e.g. Oliver" value={babyName} />
        <BodyText>You can always change this later. This is only used to make their story feel like theirs.</BodyText>
        <View style={{ height: spacing.xl }} />
        <FlourishButton onPress={onSave} title="Begin their story" />
        <Card style={styles.reassureCard}>
          <Text style={styles.reassureText}>
            🔒 This is your private space. Only people you invite can see your child&apos;s memories. No ads, no data
            sale, no public profiles.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

function DashboardScreen({
  childName,
  onCapture,
  onMilestone,
}: {
  childName: string;
  onCapture: (kind: "photo" | "video") => void;
  onMilestone: () => void;
}) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <LinearGradient colors={[colors.ink, "#3D2820"]} style={styles.darkHeroCompact}>
        <Text style={styles.kicker}>Good morning</Text>
        <SerifTitle light size={36}>
          {childName}&apos;s World
        </SerifTitle>
        <BodyText light>8 weeks &amp; 3 days old · Born 14 Apr 2026</BodyText>
      </LinearGradient>
      <Pressable onPress={onMilestone} style={styles.alertBanner}>
        <Text style={styles.alertIcon}>⭐</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertTitle}>First smile is coming</Text>
          <Text style={styles.alertSub}>Most babies smile at 6-8 weeks. Keep your camera ready.</Text>
        </View>
        <Text style={styles.alertArrow}>›</Text>
      </Pressable>

      <View style={styles.padded}>
        <Eyebrow>Capture a moment</Eyebrow>
        <View style={styles.quickCapture}>
          <QuickCapture icon="📸" label="Photo" onPress={() => onCapture("photo")} />
          <QuickCapture icon="🎥" label="Video" onPress={() => onCapture("video")} />
          <QuickCapture icon="✍️" label="Journal" onPress={() => Alert.alert("Journal", "Open the Journal tab to write privately.")} />
        </View>

        <Eyebrow>Recent memories</Eyebrow>
        <View style={styles.memoryGrid}>
          {recentMemories.map((memory) => (
            <Card key={memory.title} style={styles.memoryCard}>
              <GradientCard colors={memory.gradient} style={styles.memoryPhoto}>
                <Text style={styles.memoryEmoji}>{memory.emoji}</Text>
                {memory.badge ? <Text style={styles.memoryBadge}>{memory.badge}</Text> : null}
              </GradientCard>
              <Text style={styles.memoryTitle}>{memory.title}</Text>
              <Text style={styles.memoryDate}>{memory.date}</Text>
            </Card>
          ))}
        </View>

        <Eyebrow>Firsts tracker</Eyebrow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.firstsStrip}>
          {firsts.map((first) => (
            <View key={first.name} style={[styles.firstChip, first.done && styles.firstChipDone]}>
              <Text style={styles.firstEmoji}>{first.emoji}</Text>
              <View>
                <Text style={styles.firstName}>{first.name}</Text>
                <Text style={styles.firstAge}>{first.age}</Text>
              </View>
              {first.done ? <Text style={styles.firstTick}>✓</Text> : null}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function QuickCapture({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickButton, pressed && { transform: [{ scale: 0.97 }] }]}>
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function StickersScreen({ childName }: { childName: string }) {
  const [era, setEra] = useState<StickerEra>("baby");
  const data = eraData[era];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.padded}>
        <SerifTitle size={32}>Add a sticker</SerifTitle>
        <BodyText>Grows with {childName}. Tap an era to preview age-appropriate artwork.</BodyText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eraRow}>
          {(["baby", "little", "growing", "teen"] as StickerEra[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setEra(item)}
              style={[styles.eraButton, era === item && { backgroundColor: colors.ink, borderColor: eraData[item].accent }]}
            >
              <Text style={[styles.eraButtonText, era === item && { color: colors.cream }]}>{eraData[item].label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <GradientCard colors={data.gradient} style={styles.stickerPreview}>
        <Text style={styles.previewPhoto}>{data.preview}</Text>
        <Text style={[styles.placedSticker, styles.placedStickerOne]}>{data.s1}</Text>
        <Text style={[styles.placedSticker, styles.placedStickerTwo]}>{data.s2}</Text>
        <Text style={styles.previewCaption}>“{data.caption}”</Text>
      </GradientCard>
      <View style={styles.eraLabel}>
        <Text style={[styles.eraLabelText, { color: data.accent }]}>{data.label}</Text>
        <Text style={styles.eraNote}>{data.note} ✓</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {data.categories.map((category, index) => (
          <Text key={category} style={[styles.categoryPill, index === 0 && styles.categoryPillActive]}>
            {category}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.stickerGrid}>
        {data.stickers.map(([emoji, label], index) => (
          <View key={`${emoji}-${label}`} style={[styles.stickerItem, index === 0 && styles.stickerSelected]}>
            <Text style={styles.stickerEmoji}>{emoji}</Text>
            <Text style={styles.stickerLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.footerActions}>
        <FlourishButton onPress={() => Alert.alert("Cleared", "Sticker preview reset.")} title="Clear all" variant="outline" />
        <FlourishButton onPress={() => Alert.alert("Saved", "Sticker layout saved to the page.")} title="Save to page" />
      </View>
    </ScrollView>
  );
}

function CalendarScreen({ childName }: { childName: string }) {
  const eventMap = useMemo(() => {
    return calendarEvents.reduce<Record<number, string[]>>((acc, event) => {
      acc[event.day] = [...(acc[event.day] ?? []), event.type];
      return acc;
    }, {});
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <LinearGradient colors={[colors.ink, "#253327"]} style={styles.darkHeroCompact}>
        <SerifTitle light size={36}>May 2026</SerifTitle>
        <BodyText light>{childName} is 8 weeks old this month</BodyText>
      </LinearGradient>
      <View style={styles.calNav}>
        <Text style={styles.calArrow}>‹</Text>
        <Text style={styles.calNavLabel}>May 2026</Text>
        <Text style={styles.calArrow}>›</Text>
      </View>
      <View style={styles.weekHeader}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {[27, 28, 29, 30].map((day) => (
          <CalendarDay key={`old-${day}`} day={day} muted />
        ))}
        {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
          <CalendarDay key={day} day={day} today={day === 19} events={eventMap[day]} />
        ))}
      </View>
      <View style={styles.legend}>
        <Legend color={colors.sienna} label="Milestone" />
        <Legend color={colors.sageDark} label="Memory" />
        <Legend color={colors.gold} label="Appointment" />
      </View>
      <View style={styles.padded}>
        <Eyebrow>Coming up</Eyebrow>
        <UpcomingEvent date="22 May" color={colors.sienna} title="First smile window" meta="Milestone · Keep camera ready" />
        <UpcomingEvent date="28 May" color={colors.gold} title="6-week check-up" meta="Dr Nguyen · 10:30am" />
      </View>
    </ScrollView>
  );
}

function CalendarDay({ day, muted = false, today = false, events = [] }: { day: number; muted?: boolean; today?: boolean; events?: string[] }) {
  return (
    <View style={[styles.calendarDay, muted && styles.calendarMuted, today && styles.calendarToday]}>
      <Text style={[styles.calendarDayText, muted && { color: "rgba(44,36,32,0.25)" }, today && { color: colors.sienna }]}>
        {day}
      </Text>
      <View style={styles.eventDots}>
        {events.map((event, index) => (
          <View
            key={`${event}-${index}`}
            style={[
              styles.eventDot,
              event === "memory" && { backgroundColor: colors.sageDark },
              event === "milestone" && { backgroundColor: colors.sienna },
              event === "appt" && { backgroundColor: colors.gold },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function UpcomingEvent({ date, color, title, meta }: { date: string; color: string; title: string; meta: string }) {
  return (
    <View style={styles.upcomingEvent}>
      <Text style={styles.upcomingDate}>{date}</Text>
      <View style={[styles.upcomingDot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.upcomingTitle}>{title}</Text>
        <Text style={styles.upcomingMeta}>{meta}</Text>
      </View>
    </View>
  );
}

function PlanScreen({ appLock, onToggleAppLock }: { appLock: boolean; onToggleAppLock: (value: boolean) => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <LinearGradient colors={[colors.ink, "#3D2820"]} style={styles.darkHeroCompact}>
        <Text style={styles.planLabel}>Your plan</Text>
        <SerifTitle light size={36}>Simple, honest pricing.</SerifTitle>
        <BodyText light>No surprises. No selling your data. Just Flourish.</BodyText>
      </LinearGradient>
      <View style={styles.padded}>
        <LinearGradient colors={[colors.ink, "#3D2820"]} style={styles.currentPlan}>
          <Text style={styles.currentBadge}>Current plan</Text>
          <Text style={styles.currentPlanName}>Seedling</Text>
          <Text style={styles.currentPlanPrice}>Free forever</Text>
          {["500 photos & videos", "25 milestones tracked", "Basic scrapbook layouts", "Share with 2 family members"].map(
            (item) => (
              <Text key={item} style={styles.currentFeature}>
                ✓ {item}
              </Text>
            ),
          )}
        </LinearGradient>
        <PlanCard
          badge="Most loved"
          button="Upgrade to Bloom"
          features={[
            "Unlimited photos & videos",
            "All 200+ milestones",
            "Premium scrapbook layouts",
            "Share with 10 family members",
            "Yearly video montage",
            "Printed book discounts",
          ]}
          name="Bloom"
          price="$8"
          sub="per month · billed monthly"
        />
        <PlanCard
          button="Buy as a gift"
          features={[
            "1 printed hardcover scrapbook",
            "12 months of Bloom included",
            "Shipped to your door",
            "No subscription started",
            "Perfect baby shower gift",
          ]}
          name="Heirloom"
          price="$79"
          sub="one-time · gift"
          variant="outline"
        />
        <Card style={styles.securityPanel}>
          <View style={styles.lockRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lockTitle}>Device unlock</Text>
              <Text style={styles.lockText}>Require Face ID, Touch ID, or device passcode before opening private memories.</Text>
            </View>
            <Switch
              onValueChange={onToggleAppLock}
              thumbColor={appLock ? colors.sienna : colors.cream}
              trackColor={{ false: "rgba(44,36,32,0.16)", true: colors.blush }}
              value={appLock}
            />
          </View>
          <Text style={styles.promiseText}>
            🔒 Our promise: upgrading never changes what we do with your data. Zero ads. Zero data sharing. Always.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

function PlanCard({
  badge,
  button,
  features,
  name,
  price,
  sub,
  variant = "filled",
}: {
  badge?: string;
  button: string;
  features: string[];
  name: string;
  price: string;
  sub: string;
  variant?: "filled" | "outline";
}) {
  return (
    <Card style={[styles.planCard, badge ? { borderColor: colors.sienna } : null]}>
      {badge ? <Text style={styles.planBadge}>{badge}</Text> : null}
      <View style={styles.planTop}>
        <Text style={styles.planName}>{name}</Text>
        <View>
          <Text style={styles.planPrice}>{price}</Text>
          <Text style={styles.planSub}>{sub}</Text>
        </View>
      </View>
      {features.map((feature) => (
        <Text key={feature} style={styles.planFeature}>
          ✓ {feature}
        </Text>
      ))}
      <View style={{ height: spacing.lg }} />
      <FlourishButton onPress={() => Alert.alert(name, "Plan selection will connect to your billing provider.")} title={button} variant={variant} />
    </Card>
  );
}

function MilestoneScreen({ childName }: { childName: string }) {
  return (
    <LinearGradient colors={[colors.ink, "#3D2820"]} style={styles.milestoneScreen}>
      <View style={styles.confetti}>
        {["✨", "🌸", "⭐", "🌿", "💛"].map((emoji) => (
          <Text key={emoji} style={styles.confettiItem}>
            {emoji}
          </Text>
        ))}
      </View>
      <Text style={styles.milestoneBadge}>First captured</Text>
      <Text style={styles.milestoneEmoji}>😊</Text>
      <SerifTitle light size={44}>
        {childName}&apos;s{"\n"}First Smile
      </SerifTitle>
      <Text style={styles.milestoneDate}>Tuesday, 19 May 2026 · 6:42am</Text>
      <Text style={styles.milestonePara}>
        You caught it. The one that changes everything. That first real, full-face, eyes-crinkling smile, and it was
        meant just for you.
      </Text>
      <FlourishButton onPress={() => Alert.alert("Photo", "Use Dashboard capture to add a photo.")} title="Add a photo of this moment" />
      <View style={{ height: spacing.md }} />
      <FlourishButton onPress={() => Alert.alert("Saved", "Milestone saved to scrapbook.")} title="Save to scrapbook" variant="outline" />
      <View style={styles.shareRow}>
        {["👨‍👩‍👧", "💌", "📤"].map((emoji) => (
          <Text key={emoji} style={styles.shareIcon}>
            {emoji}
          </Text>
        ))}
      </View>
    </LinearGradient>
  );
}

function JournalScreen({ childName }: { childName: string }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.padded}>
        <SerifTitle size={34}>{childName}&apos;s Journal</SerifTitle>
        <BodyText>The things photos cannot capture.</BodyText>
      </View>
      <JournalEntry
        date="Tuesday, 19 May · 3:47am"
        emoji="😭"
        image="🌙"
        tags={["3am feed", "Week 8", "First time"]}
        text="He fell asleep on my chest tonight. I could feel his little heartbeat against mine. I have never been so tired and so full at the same time."
      />
      <JournalEntry
        date="Sunday, 14 May · 9:12am"
        emoji="🥰"
        image="☀️"
        tags={["Morning", "Home", "Peaceful"]}
        text="First proper sunny morning at home. Made coffee. He slept for two hours. I just sat and watched him breathe."
      />
      <Pressable style={styles.addJournal} onPress={() => Alert.alert("New entry", "Journal editor coming next.")}>
        <Text style={styles.addJournalIcon}>✍️</Text>
        <Text style={styles.addJournalText}>What are you feeling right now?</Text>
      </Pressable>
    </ScrollView>
  );
}

function JournalEntry({
  date,
  emoji,
  image,
  tags,
  text,
}: {
  date: string;
  emoji: string;
  image: string;
  tags: string[];
  text: string;
}) {
  return (
    <Card style={styles.journalEntry}>
      <View style={styles.tape} />
      <Text style={styles.journalMood}>{emoji}</Text>
      <Text style={styles.journalDate}>{date}</Text>
      <GradientCard colors={["#E8C4B0", "#C4907A"]} style={styles.journalImage}>
        <Text style={styles.journalImageEmoji}>{image}</Text>
      </GradientCard>
      <Text style={styles.journalText}>“{text}”</Text>
      <View style={styles.tagRow}>
        {tags.map((tag) => (
          <Text key={tag} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  appHeader: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderBottomColor: "rgba(196,169,160,0.18)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  logo: {
    color: colors.ink,
    fontFamily: fontFamily.serif,
    fontSize: 28,
    letterSpacing: 1.2,
  },
  headerSub: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 11,
  },
  headerAction: {
    borderColor: "rgba(196,169,160,0.4)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerActionText: {
    color: colors.inkLight,
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
  },
  previewBanner: {
    backgroundColor: "rgba(193,123,92,0.1)",
    borderBottomColor: "rgba(193,123,92,0.22)",
    borderBottomWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  previewBannerText: {
    color: colors.siennaDark,
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
    lineHeight: 16,
  },
  tabs: {
    backgroundColor: colors.warm,
    flexGrow: 0,
  },
  tabsContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tab: {
    alignItems: "center",
    borderColor: "rgba(196,169,160,0.22)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  tabIcon: {
    fontSize: 14,
  },
  tabText: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  tabTextActive: {
    color: colors.cream,
  },
  screen: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  screenContent: {
    paddingBottom: 40,
  },
  darkHero: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  darkHeroCompact: {
    padding: spacing.xl,
  },
  heroEmoji: {
    fontSize: 38,
    marginBottom: spacing.md,
  },
  padded: {
    padding: spacing.xl,
  },
  reassureCard: {
    backgroundColor: "rgba(181,196,177,0.16)",
    borderLeftColor: colors.sageDark,
    borderLeftWidth: 2,
    marginTop: spacing.xl,
  },
  reassureText: {
    color: colors.inkLight,
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 20,
  },
  kicker: {
    color: "rgba(251,247,242,0.44)",
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  alertBanner: {
    alignItems: "center",
    backgroundColor: colors.sienna,
    flexDirection: "row",
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: -spacing.sm,
    padding: spacing.lg,
    ...shadow.glow,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertTitle: {
    color: colors.white,
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
  },
  alertSub: {
    color: "rgba(255,255,255,0.76)",
    fontFamily: fontFamily.sans,
    fontSize: 11,
    marginTop: 2,
  },
  alertArrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 26,
  },
  quickCapture: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickButton: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.25)",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: spacing.lg,
  },
  quickIcon: {
    fontSize: 26,
  },
  quickLabel: {
    color: colors.inkLight,
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    textTransform: "uppercase",
  },
  memoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  memoryCard: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: spacing.sm,
  },
  memoryPhoto: {
    alignItems: "center",
    borderRadius: 10,
    height: 100,
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  memoryEmoji: {
    fontSize: 34,
  },
  memoryBadge: {
    backgroundColor: colors.sienna,
    borderRadius: 999,
    color: colors.white,
    fontFamily: fontFamily.sansMedium,
    fontSize: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    position: "absolute",
    right: spacing.sm,
    top: spacing.sm,
    textTransform: "uppercase",
  },
  memoryTitle: {
    color: colors.ink,
    fontFamily: fontFamily.sansMedium,
    fontSize: 13,
  },
  memoryDate: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 10,
    marginTop: 2,
  },
  firstsStrip: {
    gap: spacing.md,
    paddingRight: spacing.xl,
  },
  firstChip: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.25)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  firstChipDone: {
    backgroundColor: "rgba(122,158,126,0.12)",
    borderColor: "rgba(122,158,126,0.3)",
  },
  firstEmoji: {
    fontSize: 19,
  },
  firstName: {
    color: colors.ink,
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
  },
  firstAge: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 10,
  },
  firstTick: {
    color: colors.sageDark,
    fontFamily: fontFamily.sansMedium,
  },
  eraRow: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  eraButton: {
    borderColor: "rgba(196,169,160,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  eraButtonText: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
  },
  stickerPreview: {
    alignItems: "center",
    height: 220,
    justifyContent: "center",
    marginHorizontal: spacing.xl,
  },
  previewPhoto: {
    fontSize: 62,
  },
  placedSticker: {
    fontSize: 30,
    position: "absolute",
  },
  placedStickerOne: {
    right: 34,
    top: 28,
  },
  placedStickerTwo: {
    bottom: 48,
    left: 32,
  },
  previewCaption: {
    bottom: spacing.lg,
    color: "rgba(44,36,32,0.62)",
    fontFamily: fontFamily.journal,
    fontSize: 13,
    position: "absolute",
  },
  eraLabel: {
    alignItems: "center",
    backgroundColor: "rgba(193,123,92,0.08)",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: spacing.xl,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  eraLabelText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
  },
  eraNote: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 10,
  },
  categoryRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  categoryPill: {
    borderColor: "rgba(196,169,160,0.32)",
    borderRadius: 999,
    borderWidth: 1,
    color: colors.inkMuted,
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
    color: colors.cream,
  },
  stickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: spacing.xl,
  },
  stickerItem: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.18)",
    borderWidth: 0.5,
    paddingVertical: spacing.lg,
    width: "20%",
  },
  stickerSelected: {
    backgroundColor: "rgba(193,123,92,0.1)",
  },
  stickerEmoji: {
    fontSize: 25,
  },
  stickerLabel: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 8,
    marginTop: spacing.xs,
  },
  footerActions: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.xl,
  },
  calNav: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderBottomColor: "rgba(196,169,160,0.18)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  calArrow: {
    color: colors.ink,
    fontSize: 26,
  },
  calNavLabel: {
    color: colors.ink,
    fontFamily: fontFamily.serif,
    fontSize: 22,
  },
  weekHeader: {
    backgroundColor: colors.warm,
    flexDirection: "row",
  },
  weekDay: {
    color: colors.inkMuted,
    flex: 1,
    fontFamily: fontFamily.sansMedium,
    fontSize: 9,
    letterSpacing: 1,
    paddingVertical: spacing.md,
    textAlign: "center",
    textTransform: "uppercase",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.14)",
    borderWidth: 0.5,
    minHeight: 58,
    padding: spacing.sm,
    width: `${100 / 7}%`,
  },
  calendarMuted: {
    backgroundColor: "rgba(254,252,249,0.54)",
  },
  calendarToday: {
    backgroundColor: "rgba(193,123,92,0.09)",
  },
  calendarDayText: {
    color: colors.ink,
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
  },
  eventDots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    marginTop: spacing.xs,
  },
  eventDot: {
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  legend: {
    backgroundColor: colors.warm,
    borderTopColor: "rgba(196,169,160,0.18)",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  legendDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  legendText: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 10,
  },
  upcomingEvent: {
    alignItems: "center",
    borderBottomColor: "rgba(196,169,160,0.16)",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  upcomingDate: {
    color: colors.ink,
    fontFamily: fontFamily.serif,
    fontSize: 20,
    width: 62,
  },
  upcomingDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  upcomingTitle: {
    color: colors.ink,
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
  },
  upcomingMeta: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 11,
  },
  planLabel: {
    color: colors.gold,
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  currentPlan: {
    borderRadius: 16,
    marginBottom: spacing.lg,
    padding: spacing.xl,
  },
  currentBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.gold,
    color: colors.ink,
    fontFamily: fontFamily.sansMedium,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textTransform: "uppercase",
  },
  currentPlanName: {
    color: colors.cream,
    fontFamily: fontFamily.serif,
    fontSize: 30,
  },
  currentPlanPrice: {
    color: "rgba(251,247,242,0.48)",
    fontFamily: fontFamily.sans,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  currentFeature: {
    color: "rgba(251,247,242,0.72)",
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 22,
  },
  planCard: {
    marginBottom: spacing.lg,
  },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.sienna,
    color: colors.white,
    fontFamily: fontFamily.sansMedium,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textTransform: "uppercase",
  },
  planTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  planName: {
    color: colors.ink,
    fontFamily: fontFamily.serif,
    fontSize: 26,
  },
  planPrice: {
    color: colors.ink,
    fontFamily: fontFamily.serif,
    fontSize: 30,
    textAlign: "right",
  },
  planSub: {
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 10,
    textAlign: "right",
  },
  planFeature: {
    color: colors.inkLight,
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 22,
  },
  securityPanel: {
    backgroundColor: "rgba(181,196,177,0.14)",
  },
  lockRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  lockTitle: {
    color: colors.ink,
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
  },
  lockText: {
    color: colors.inkLight,
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  promiseText: {
    color: colors.inkLight,
    fontFamily: fontFamily.sans,
    fontSize: 12,
    lineHeight: 19,
  },
  milestoneScreen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  confetti: {
    flexDirection: "row",
    justifyContent: "space-around",
    left: 0,
    position: "absolute",
    right: 0,
    top: spacing.xl,
  },
  confettiItem: {
    fontSize: 22,
    opacity: 0.7,
  },
  milestoneBadge: {
    backgroundColor: colors.sienna,
    color: colors.white,
    fontFamily: fontFamily.sansMedium,
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    textTransform: "uppercase",
  },
  milestoneEmoji: {
    fontSize: 74,
    marginBottom: spacing.lg,
  },
  milestoneDate: {
    color: "rgba(251,247,242,0.44)",
    fontFamily: fontFamily.sans,
    fontSize: 12,
    letterSpacing: 0.8,
    marginTop: spacing.md,
  },
  milestonePara: {
    color: "rgba(251,247,242,0.7)",
    fontFamily: fontFamily.sans,
    fontSize: 15,
    lineHeight: 25,
    marginVertical: spacing.xl,
    textAlign: "center",
  },
  shareRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  shareIcon: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    fontSize: 18,
    overflow: "hidden",
    padding: spacing.md,
  },
  journalEntry: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  tape: {
    alignSelf: "center",
    backgroundColor: "rgba(201,169,110,0.35)",
    borderRadius: 2,
    height: 14,
    marginTop: -24,
    width: 48,
  },
  journalMood: {
    fontSize: 22,
    position: "absolute",
    right: spacing.lg,
    top: spacing.lg,
  },
  journalDate: {
    color: colors.sienna,
    fontFamily: fontFamily.sansMedium,
    fontSize: 9,
    letterSpacing: 1.1,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    textTransform: "uppercase",
  },
  journalImage: {
    alignItems: "center",
    height: 128,
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  journalImageEmoji: {
    fontSize: 38,
  },
  journalText: {
    color: colors.inkLight,
    fontFamily: fontFamily.journal,
    fontSize: 15,
    lineHeight: 25,
    marginBottom: spacing.md,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.cream,
    borderRadius: 999,
    color: colors.inkMuted,
    fontFamily: fontFamily.sans,
    fontSize: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  addJournal: {
    alignItems: "center",
    borderColor: "rgba(196,169,160,0.42)",
    borderRadius: 14,
    borderStyle: "dashed",
    borderWidth: 1.5,
    margin: spacing.xl,
    padding: spacing.xl,
  },
  addJournalIcon: {
    fontSize: 26,
    marginBottom: spacing.sm,
  },
  addJournalText: {
    color: colors.inkMuted,
    fontFamily: fontFamily.serifItalic,
    fontSize: 18,
  },
});
