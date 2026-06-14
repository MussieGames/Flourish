import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { isFirebaseConfigured } from "./src/firebase/client";
import { colors, fonts, shadow, spacing } from "./src/theme";
import {
  canUseDeviceLock,
  getDeviceLockEnabled,
  setDeviceLockEnabled,
  unlockPrivateMemories
} from "./src/services/devicePrivacy";
import {
  createChildProfile,
  saveJournalMemory
} from "./src/services/flourishRepository";

type TabId = "home" | "capture" | "scrapbook" | "firsts" | "plan";
type EraId = "baby" | "little" | "growing" | "teen";

const eraData: Record<
  EraId,
  {
    label: string;
    note: string;
    preview: string;
    stickers: string[];
    categories: string[];
    colors: readonly [string, string];
  }
> = {
  baby: {
    label: "Baby Era - 0-2 years",
    note: "Auto-selected",
    preview: "🍼",
    stickers: ["⭐", "🌙", "🍼", "🧸", "🌿", "💛", "🎀", "🌸", "🦋", "🌈"],
    categories: ["Nursery", "Nature", "Firsts", "Love"],
    colors: ["#E8C4B0", "#C4907A"]
  },
  little: {
    label: "Little One Era - 3-7 years",
    note: "Playful and bright",
    preview: "🐻",
    stickers: ["🦁", "🐘", "🌈", "🎨", "🚂", "🦕", "🎪", "🌟", "🧩", "🐠"],
    categories: ["Animals", "Adventure", "School", "Friends"],
    colors: ["#C5D9C0", "#88BF88"]
  },
  growing: {
    label: "Growing Up Era - 8-12 years",
    note: "Interests and personality",
    preview: "⚽",
    stickers: ["🏆", "⚽", "🎵", "🎸", "🌍", "🏄", "🎯", "📚", "🎮", "🚴"],
    categories: ["Sport", "Music", "Nature", "Create"],
    colors: ["#C4C0D8", "#A090C0"]
  },
  teen: {
    label: "Teen Era - 13-18 years",
    note: "Minimal and personal",
    preview: "🎵",
    stickers: ["◈", "∞", "◯", "△", "✦", "🎵", "🎧", "🌙", "✈️", "📷"],
    categories: ["Minimal", "Music", "Travel", "Mood"],
    colors: ["#2C2420", "#4A3830"]
  }
};

const memories = [
  { title: "First bath", when: "Yesterday, 7:14pm", emoji: "🍼", colors: ["#E8C4B0", "#C4907A"] },
  { title: "Sleeping angel", when: "2 days ago", emoji: "😴", colors: ["#C5D4C0", "#A8BFA8"] },
  { title: "Tiny footprints", when: "Day 1", emoji: "👣", colors: ["#E8D5B0", "#D4B880"] },
  { title: "Skin to skin", when: "Day 1, 9:42am", emoji: "🤱", colors: ["#D4C4D8", "#B4A0C0"] }
] as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionLabel}>{children}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        shadow.warm,
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function TopHero({
  eyebrow,
  title,
  accent,
  subtitle
}: {
  eyebrow?: string;
  title: string;
  accent: string;
  subtitle: string;
}) {
  return (
    <LinearGradient colors={[colors.ink, "#3D2820"]} style={styles.hero}>
      {eyebrow ? <Text style={styles.heroEyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.heroTitle}>
        {title}
        <Text style={styles.heroAccent}>{accent}</Text>
      </Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </LinearGradient>
  );
}

function WelcomeScreen({
  onComplete
}: {
  onComplete: (name: string, childId?: string) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const firebaseReady = isFirebaseConfigured();

  async function begin() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert("Add a name", "A first name keeps memories organized privately.");
      return;
    }

    setSaving(true);
    try {
      const childId = firebaseReady
        ? await createChildProfile({ name: trimmed })
        : undefined;
      onComplete(trimmed, childId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Could not save yet", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.grow}>
      <TopHero
        title={"Welcome to\n"}
        accent="Flourish."
        subtitle="You just did something extraordinary. In between the feeds, the tears, and the love that does not fit into words, Flourish helps catch every moment before it slips by."
      />
      <View style={styles.content}>
        <SectionLabel>Let's begin</SectionLabel>
        <Text style={styles.largeQuestion}>
          What's your{"\n"}
          <Text style={styles.italicAccent}>little one's</Text> name?
        </Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>🍼</Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={80}
            onChangeText={setName}
            placeholder="e.g. Oliver"
            placeholderTextColor={colors.inkMuted}
            style={styles.input}
            value={name}
          />
        </View>
        <Text style={styles.hint}>
          You can always change this later. This is just for us to make their
          story feel like theirs.
        </Text>
        <PrimaryButton
          disabled={saving}
          label={saving ? "Saving..." : "Begin their story"}
          onPress={begin}
        />
        {!firebaseReady ? (
          <Text style={styles.configNotice}>
            Demo mode: add EXPO_PUBLIC_FIREBASE_* values to connect Firebase.
          </Text>
        ) : null}
        <Pressable onPress={() => onComplete("Oliver")}>
          <Text style={styles.skip}>I'll add this later</Text>
        </Pressable>
      </View>
      <View style={styles.reassure}>
        <Text style={styles.reassureText}>
          🔒 <Text style={styles.boldSage}>Private by design.</Text> Only people
          you invite can see memories. Firebase rules enforce ownership, and
          private data is never stored in plain local app storage.
        </Text>
      </View>
    </ScrollView>
  );
}

function DashboardScreen({
  childName,
  onCapture
}: {
  childName: string;
  onCapture: () => void;
}) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.bottomPadding}>
      <TopHero
        eyebrow="Good morning"
        title={`${childName}'s `}
        accent="World"
        subtitle="8 weeks and 3 days old - born 14 Apr 2026"
      />
      <Pressable style={styles.milestoneAlert}>
        <Text style={styles.alertIcon}>⭐</Text>
        <View style={styles.flex}>
          <Text style={styles.alertTitle}>First smile is coming</Text>
          <Text style={styles.alertSub}>Most babies smile at 6-8 weeks. Keep your camera ready.</Text>
        </View>
        <Text style={styles.alertArrow}>›</Text>
      </Pressable>

      <View style={styles.contentTight}>
        <SectionLabel>Capture a moment</SectionLabel>
        <View style={styles.quickRow}>
          {[
            ["📸", "Photo"],
            ["🎥", "Video"],
            ["✍️", "Journal"]
          ].map(([emoji, label]) => (
            <Pressable key={label} onPress={onCapture} style={styles.quickButton}>
              <Text style={styles.quickEmoji}>{emoji}</Text>
              <Text style={styles.quickLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <SectionLabel>Recent memories</SectionLabel>
        <View style={styles.memoryGrid}>
          {memories.map((memory, index) => (
            <Pressable key={memory.title} style={styles.memoryCard}>
              <LinearGradient colors={memory.colors} style={styles.memoryPhoto}>
                <Text style={styles.memoryEmoji}>{memory.emoji}</Text>
                {index === 0 ? <Text style={styles.newBadge}>New</Text> : null}
              </LinearGradient>
              <View style={styles.memoryMeta}>
                <Text style={styles.memoryTitle}>{memory.title}</Text>
                <Text style={styles.memoryWhen}>{memory.when}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <SectionLabel>Firsts tracker</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            ["🏥", "First day home", "Day 2", true],
            ["🛁", "First bath", "Week 1", true],
            ["😊", "First smile", "~6-8 wks", false],
            ["😂", "First giggle", "~3-4 mo", false]
          ].map(([emoji, title, age, done]) => (
            <View key={String(title)} style={[styles.firstChip, done && styles.firstDone]}>
              <Text style={styles.firstEmoji}>{emoji}</Text>
              <View>
                <Text style={styles.firstName}>{title}</Text>
                <Text style={styles.firstAge}>{age}</Text>
              </View>
              {done ? <Text style={styles.tick}>✓</Text> : null}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function StickerScreen() {
  const [era, setEra] = useState<EraId>("baby");
  const data = eraData[era];
  const eras = Object.keys(eraData) as EraId[];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.bottomPadding}>
      <View style={styles.lightHeader}>
        <Text style={styles.headerBack}>‹</Text>
        <Text style={styles.lightTitle}>
          Add a <Text style={styles.italicAccent}>sticker</Text>
        </Text>
        <Text style={styles.lightSub}>Grows with your child - tap to place</Text>
      </View>

      <View style={styles.contentTight}>
        <SectionLabel>Age era</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eraRow}>
          {eras.map((eraId) => (
            <Pressable
              key={eraId}
              onPress={() => setEra(eraId)}
              style={[styles.eraPill, era === eraId && styles.eraPillActive]}
            >
              <Text style={[styles.eraPillText, era === eraId && styles.eraPillTextActive]}>
                {eraData[eraId].label.split(" ")[0]} {eraId}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <LinearGradient colors={data.colors} style={styles.preview}>
          <View style={styles.tape} />
          <Text style={styles.previewPhoto}>{data.preview}</Text>
          <Text style={[styles.floatingSticker, styles.floatingOne]}>{data.stickers[0]}</Text>
          <Text style={[styles.floatingStickerSmall, styles.floatingTwo]}>{data.stickers[1]}</Text>
          <Text style={styles.previewCaption}>"The morning everything changed..."</Text>
        </LinearGradient>

        <View style={styles.eraLabel}>
          <Text style={styles.eraLabelText}>{data.label}</Text>
          <Text style={styles.eraNote}>{data.note}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {data.categories.map((category, index) => (
            <View key={category} style={[styles.categoryPill, index === 0 && styles.categoryActive]}>
              <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>
                {category}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.stickerGrid}>
          {data.stickers.map((sticker, index) => (
            <Pressable key={`${sticker}-${index}`} style={styles.stickerItem}>
              <Text style={styles.stickerEmoji}>{sticker}</Text>
              {index === 0 ? <Text style={styles.selectedMark}>✓</Text> : null}
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function CalendarScreen() {
  const days = Array.from({ length: 35 }, (_, index) => index - 3);
  const events: Record<number, ("memory" | "milestone" | "appt")[]> = {
    1: ["memory"],
    5: ["appt"],
    7: ["memory", "memory"],
    12: ["milestone"],
    14: ["memory", "milestone"],
    16: ["appt"],
    19: ["memory"]
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.bottomPadding}>
      <TopHero
        title="May "
        accent="2026"
        subtitle="Oliver is 8 weeks old this month"
      />
      <View style={styles.calendarNav}>
        <Text style={styles.navArrow}>‹</Text>
        <Text style={styles.calendarTitle}>May 2026</Text>
        <Text style={styles.navArrow}>›</Text>
      </View>
      <View style={styles.weekHeader}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          const date = day <= 0 ? 30 + day : day;
          const otherMonth = day <= 0;
          const dots = events[day] ?? [];
          return (
            <Pressable
              key={`${day}-${index}`}
              style={[styles.dayCell, otherMonth && styles.otherMonth, day === 19 && styles.today]}
            >
              <Text style={[styles.dayNum, otherMonth && styles.otherMonthText]}>{date}</Text>
              <View style={styles.dotRow}>
                {dots.map((dot, dotIndex) => (
                  <View key={`${dot}-${dotIndex}`} style={[styles.dot, styles[`${dot}Dot`]]} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.legend}>
        <LegendDot color={colors.sienna} label="Milestone" />
        <LegendDot color={colors.sageDark} label="Memory" />
        <LegendDot color={colors.gold} label="Appointment" />
      </View>
      <View style={styles.contentTight}>
        <SectionLabel>Coming up</SectionLabel>
        <UpcomingEvent day="22" month="May" title="First smile window" subtitle="Milestone - keep camera ready" color={colors.sienna} />
        <UpcomingEvent day="28" month="May" title="6-week check-up" subtitle="Dr Nguyen - 10:30am" color={colors.gold} />
      </View>
    </ScrollView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function UpcomingEvent({
  day,
  month,
  title,
  subtitle,
  color
}: {
  day: string;
  month: string;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <View style={styles.upcomingEvent}>
      <View style={styles.datePill}>
        <Text style={styles.dateDay}>{day}</Text>
        <Text style={styles.dateMonth}>{month}</Text>
      </View>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      <View style={styles.flex}>
        <Text style={styles.upcomingTitle}>{title}</Text>
        <Text style={styles.upcomingSub}>{subtitle}</Text>
      </View>
    </View>
  );
}

function JournalScreen({ childId }: { childId?: string }) {
  const [saving, setSaving] = useState(false);

  async function addJournalPrompt() {
    if (!childId || !isFirebaseConfigured()) {
      Alert.alert("Journal ready", "Connect Firebase and finish onboarding to save this privately.");
      return;
    }

    setSaving(true);
    try {
      await saveJournalMemory({
        childId,
        title: "3am feed",
        kind: "journal",
        note: "He fell asleep on my chest tonight. I could feel his little heartbeat against mine."
      });
      Alert.alert("Saved", "Journal entry saved privately.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      Alert.alert("Could not save", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.bottomPadding}>
      <View style={styles.lightHeader}>
        <Text style={styles.lightTitle}>
          Oliver's <Text style={styles.italicAccent}>Journal</Text>
        </Text>
        <Text style={styles.lightSub}>The things photos cannot capture</Text>
      </View>
      <View style={styles.contentTight}>
        <JournalEntry
          mood="😭"
          date="Tuesday, 19 May - 3:47am"
          photo="🌙"
          text="He fell asleep on my chest tonight. I could feel his little heartbeat against mine. I have never been so tired and so full at the same time."
          tags={["3am feed", "Week 8", "First time"]}
        />
        <JournalEntry
          mood="🥰"
          date="Sunday, 14 May - 9:12am"
          photo="☀️"
          text="First proper sunny morning at home. Made coffee. He slept for two hours. I just sat and watched him breathe."
          tags={["Morning", "Home", "Peaceful"]}
        />
        <Pressable onPress={addJournalPrompt} style={styles.addJournal}>
          <Text style={styles.addJournalIcon}>✍️</Text>
          <Text style={styles.addJournalText}>{saving ? "Saving..." : "What are you feeling right now?"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function JournalEntry({
  mood,
  date,
  photo,
  text,
  tags
}: {
  mood: string;
  date: string;
  photo: string;
  text: string;
  tags: string[];
}) {
  return (
    <View style={styles.journalEntry}>
      <View style={styles.tapeSmall} />
      <Text style={styles.mood}>{mood}</Text>
      <Text style={styles.journalDate}>{date}</Text>
      <LinearGradient colors={["#E8C4B0", "#C4907A"]} style={styles.journalPhoto}>
        <Text style={styles.memoryEmoji}>{photo}</Text>
      </LinearGradient>
      <Text style={styles.journalText}>"{text}"</Text>
      <View style={styles.tagRow}>
        {tags.map((tag) => (
          <Text key={tag} style={styles.tag}>{tag}</Text>
        ))}
      </View>
    </View>
  );
}

function MilestoneScreen() {
  return (
    <LinearGradient colors={[colors.ink, "#3D2820"]} style={styles.milestoneScreen}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <Text style={styles.milestoneBadge}>First captured</Text>
      <Text style={styles.bigEmoji}>😊</Text>
      <Text style={styles.milestoneTitle}>
        Oliver's{"\n"}
        <Text style={styles.heroAccent}>First Smile</Text>
      </Text>
      <Text style={styles.milestoneDate}>Tuesday, 19 May 2026 - 6:42am</Text>
      <Text style={styles.milestonePara}>
        You caught it. The one that changes everything. That first real,
        full-face, eyes-crinkling smile - and it was meant just for you.
      </Text>
      <PrimaryButton label="Add a photo of this moment" onPress={() => Alert.alert("Capture", "Camera flow can be connected with expo-image-picker.")} />
      <Pressable style={styles.secondaryButton}>
        <Text style={styles.secondaryText}>Save to scrapbook</Text>
      </Pressable>
      <View style={styles.shareRow}>
        {["👨‍👩‍👧", "💌", "📤"].map((icon) => (
          <View key={icon} style={styles.shareIcon}><Text>{icon}</Text></View>
        ))}
      </View>
    </LinearGradient>
  );
}

function PlanScreen() {
  const [lockEnabled, setLockEnabled] = useState(false);
  const [lockAvailable, setLockAvailable] = useState(false);

  useEffect(() => {
    void Promise.all([getDeviceLockEnabled(), canUseDeviceLock()]).then(
      ([enabled, available]) => {
        setLockEnabled(enabled);
        setLockAvailable(available);
      }
    );
  }, []);

  async function toggleLock(value: boolean) {
    if (value) {
      const unlocked = await unlockPrivateMemories();
      if (!unlocked) {
        return;
      }
    }
    await setDeviceLockEnabled(value);
    setLockEnabled(value);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.bottomPadding}>
      <TopHero
        eyebrow="Your plan"
        title={"Simple,\n"}
        accent="honest pricing."
        subtitle="No surprises. No selling your data. Just Flourish."
      />
      <View style={styles.currentPlan}>
        <Text style={styles.currentBadge}>Current plan</Text>
        <Text style={styles.currentName}>Seedling</Text>
        <Text style={styles.currentPrice}>Free forever</Text>
        {["500 photos and videos", "25 milestones tracked", "Basic scrapbook layouts", "Share with 2 family members"].map((feature) => (
          <Text key={feature} style={styles.darkFeature}>✓ {feature}</Text>
        ))}
      </View>
      <View style={styles.contentTight}>
        <PlanCard
          recommended
          name="Bloom"
          price="$8"
          period="per month"
          cta="Upgrade to Bloom"
          features={["Unlimited photos and videos", "All 200+ milestones", "Premium scrapbook layouts", "Share with 10 family members", "Yearly video montage"]}
        />
        <PlanCard
          name="Heirloom"
          price="$79"
          period="one-time gift"
          cta="Buy as a gift"
          features={["1 printed hardcover scrapbook", "12 months of Bloom included", "Shipped to your door", "No subscription started"]}
        />
        <View style={styles.securityCard}>
          <View style={styles.flex}>
            <Text style={styles.securityTitle}>Device privacy lock</Text>
            <Text style={styles.securityText}>
              Adds Face ID, Touch ID, or device passcode before showing private memories on this phone.
            </Text>
            {!lockAvailable ? (
              <Text style={styles.configNotice}>Enable biometrics or passcode on this device to use this.</Text>
            ) : null}
          </View>
          <Switch
            disabled={!lockAvailable}
            onValueChange={(value) => void toggleLock(value)}
            value={lockEnabled}
            trackColor={{ false: colors.blush, true: colors.sage }}
            thumbColor={lockEnabled ? colors.sageDark : colors.warm}
          />
        </View>
        <View style={styles.planNote}>
          <Text style={styles.planNoteText}>
            🔒 <Text style={styles.boldSage}>Our promise:</Text> Upgrading never changes what we do with your data. Zero ads. Zero data sharing. Always.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function PlanCard({
  name,
  price,
  period,
  features,
  cta,
  recommended
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  recommended?: boolean;
}) {
  return (
    <View style={[styles.planCard, recommended && styles.recommended]}>
      {recommended ? <Text style={styles.recommendedBadge}>Most loved</Text> : null}
      <View style={styles.planTop}>
        <Text style={styles.planName}>{name}</Text>
        <View>
          <Text style={styles.planPrice}>{price}</Text>
          <Text style={styles.planPeriod}>{period}</Text>
        </View>
      </View>
      {features.map((feature) => (
        <Text key={feature} style={styles.planFeature}>✓ {feature}</Text>
      ))}
      <Pressable style={[styles.planButton, recommended && styles.planButtonFilled]}>
        <Text style={[styles.planButtonText, recommended && styles.planButtonTextFilled]}>{cta}</Text>
      </Pressable>
    </View>
  );
}

function BottomNav({
  active,
  onChange
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "capture", label: "Capture", icon: "📸" },
    { id: "scrapbook", label: "Scrapbook", icon: "📖" },
    { id: "firsts", label: "Firsts", icon: "⭐" },
    { id: "plan", label: "Plan", icon: "👤" }
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: active === tab.id }}
          key={tab.id}
          onPress={() => onChange(tab.id)}
          style={styles.navItem}
        >
          <Text style={[styles.navIcon, active === tab.id && styles.navIconActive]}>{tab.icon}</Text>
          <Text style={[styles.navLabel, active === tab.id && styles.navLabelActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function AppContent() {
  const [childName, setChildName] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const activeScreen = useMemo(() => {
    if (!childName) {
      return null;
    }

    switch (activeTab) {
      case "home":
        return <DashboardScreen childName={childName} onCapture={() => setActiveTab("capture")} />;
      case "capture":
        return <StickerScreen />;
      case "scrapbook":
        return <JournalScreen childId={childId} />;
      case "firsts":
        return <MilestoneScreen />;
      case "plan":
        return <PlanScreen />;
      default:
        return <DashboardScreen childName={childName} onCapture={() => setActiveTab("capture")} />;
    }
  }, [activeTab, childId, childName]);

  if (!childName) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <WelcomeScreen
          onComplete={(name, savedChildId) => {
            setChildName(name || "Oliver");
            setChildId(savedChildId);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.appFrame}>
        {activeScreen}
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream
  },
  appFrame: {
    flex: 1,
    backgroundColor: colors.cream
  },
  screen: {
    flex: 1,
    backgroundColor: colors.cream
  },
  grow: {
    flexGrow: 1
  },
  bottomPadding: {
    paddingBottom: 110
  },
  flex: {
    flex: 1
  },
  hero: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.xxxl + spacing.md
  },
  heroEyebrow: {
    color: "rgba(251,247,242,0.45)",
    fontFamily: fonts.sans,
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.cream,
    fontFamily: fonts.serif,
    fontSize: 36,
    fontWeight: "300",
    lineHeight: 40
  },
  heroAccent: {
    color: colors.rose,
    fontStyle: "italic"
  },
  heroSubtitle: {
    color: "rgba(251,247,242,0.62)",
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 24,
    marginTop: spacing.md
  },
  content: {
    padding: spacing.xxl
  },
  contentTight: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl
  },
  sectionLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  sectionLine: {
    backgroundColor: colors.sienna,
    height: 1,
    width: 16
  },
  sectionLabel: {
    color: colors.sienna,
    fontFamily: fonts.sans,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  largeQuestion: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 35,
    marginBottom: spacing.xl
  },
  italicAccent: {
    color: colors.sienna,
    fontFamily: fonts.serif,
    fontStyle: "italic"
  },
  inputWrap: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.35)",
    borderRadius: 4,
    borderWidth: 1.5,
    flexDirection: "row",
    paddingHorizontal: spacing.lg
  },
  inputIcon: {
    fontSize: 20,
    marginRight: spacing.md
  },
  input: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 24,
    fontStyle: "italic",
    paddingVertical: spacing.lg
  },
  hint: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 20,
    marginBottom: spacing.xl,
    marginTop: spacing.md
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.sienna,
    borderRadius: 4,
    padding: spacing.lg
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1.3,
    textTransform: "uppercase"
  },
  disabled: {
    opacity: 0.6
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  configNotice: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.sm
  },
  skip: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: "center",
    textDecorationLine: "underline"
  },
  reassure: {
    backgroundColor: "rgba(181,196,177,0.15)",
    borderLeftColor: colors.sageDark,
    borderLeftWidth: 2,
    margin: spacing.xxl,
    marginTop: 0,
    padding: spacing.lg
  },
  reassureText: {
    color: colors.inkLight,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 20
  },
  boldSage: {
    color: colors.sageDark,
    fontWeight: "700"
  },
  milestoneAlert: {
    alignItems: "center",
    backgroundColor: colors.sienna,
    flexDirection: "row",
    gap: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: -spacing.sm,
    padding: spacing.lg
  },
  alertIcon: {
    fontSize: 22
  },
  alertTitle: {
    color: colors.white,
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "600"
  },
  alertSub: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: fonts.sans,
    fontSize: 11,
    marginTop: 2
  },
  alertArrow: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 24
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xxl
  },
  quickButton: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.28)",
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    padding: spacing.lg
  },
  quickEmoji: {
    fontSize: 24
  },
  quickLabel: {
    color: colors.inkLight,
    fontFamily: fonts.sans,
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: spacing.xs,
    textTransform: "uppercase"
  },
  memoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xxl
  },
  memoryCard: {
    backgroundColor: colors.warm,
    borderRadius: 6,
    overflow: "hidden",
    width: "48%"
  },
  memoryPhoto: {
    alignItems: "center",
    height: 92,
    justifyContent: "center"
  },
  memoryEmoji: {
    fontSize: 36
  },
  newBadge: {
    backgroundColor: colors.sienna,
    borderRadius: 10,
    color: colors.white,
    fontFamily: fonts.sans,
    fontSize: 8,
    letterSpacing: 0.6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    position: "absolute",
    right: spacing.sm,
    textTransform: "uppercase",
    top: spacing.sm
  },
  memoryMeta: {
    padding: spacing.md
  },
  memoryTitle: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: "600"
  },
  memoryWhen: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 10,
    marginTop: 2
  },
  firstChip: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.26)",
    borderRadius: 40,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  firstDone: {
    backgroundColor: "rgba(122,158,126,0.1)",
    borderColor: "rgba(122,158,126,0.3)"
  },
  firstEmoji: {
    fontSize: 20
  },
  firstName: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: "600"
  },
  firstAge: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 9
  },
  tick: {
    color: colors.sageDark,
    fontWeight: "800"
  },
  lightHeader: {
    backgroundColor: colors.warm,
    borderBottomColor: "rgba(196,169,160,0.2)",
    borderBottomWidth: 1,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl
  },
  headerBack: {
    color: colors.ink,
    fontSize: 30,
    marginBottom: spacing.sm
  },
  lightTitle: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 31,
    fontWeight: "300"
  },
  lightSub: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: spacing.xs
  },
  eraRow: {
    marginBottom: spacing.md
  },
  eraPill: {
    borderColor: "rgba(196,169,160,0.3)",
    borderRadius: 24,
    borderWidth: 1,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  eraPillActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  eraPillText: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 11,
    textTransform: "capitalize"
  },
  eraPillTextActive: {
    color: colors.cream
  },
  preview: {
    alignItems: "center",
    borderRadius: 8,
    height: 190,
    justifyContent: "center",
    marginTop: spacing.sm,
    overflow: "hidden"
  },
  tape: {
    backgroundColor: "rgba(201,169,110,0.38)",
    height: 16,
    position: "absolute",
    top: 0,
    width: 52
  },
  previewPhoto: {
    fontSize: 60
  },
  floatingSticker: {
    fontSize: 32,
    position: "absolute"
  },
  floatingStickerSmall: {
    fontSize: 24,
    position: "absolute"
  },
  floatingOne: {
    right: spacing.xl,
    top: spacing.xl
  },
  floatingTwo: {
    bottom: spacing.xxxl,
    left: spacing.lg
  },
  previewCaption: {
    bottom: spacing.md,
    color: "rgba(44,36,32,0.58)",
    fontFamily: fonts.serif,
    fontSize: 12,
    fontStyle: "italic",
    position: "absolute"
  },
  eraLabel: {
    backgroundColor: "rgba(193,123,92,0.08)",
    borderLeftColor: colors.sienna,
    borderLeftWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    padding: spacing.md
  },
  eraLabelText: {
    color: colors.sienna,
    fontFamily: fonts.sans,
    fontSize: 11
  },
  eraNote: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 10
  },
  categoryRow: {
    marginVertical: spacing.md
  },
  categoryPill: {
    borderColor: "rgba(196,169,160,0.3)",
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  categoryActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  categoryText: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 11
  },
  categoryTextActive: {
    color: colors.cream
  },
  stickerGrid: {
    backgroundColor: "rgba(196,169,160,0.18)",
    borderRadius: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    overflow: "hidden"
  },
  stickerItem: {
    alignItems: "center",
    backgroundColor: colors.warm,
    justifyContent: "center",
    minHeight: 68,
    position: "relative",
    width: "19.7%"
  },
  stickerEmoji: {
    fontSize: 27
  },
  selectedMark: {
    color: colors.sienna,
    fontSize: 11,
    fontWeight: "800",
    position: "absolute",
    right: 5,
    top: 3
  },
  calendarNav: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderBottomColor: "rgba(196,169,160,0.2)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg
  },
  navArrow: {
    color: colors.ink,
    fontSize: 24
  },
  calendarTitle: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 22
  },
  weekHeader: {
    backgroundColor: colors.warm,
    flexDirection: "row"
  },
  weekDay: {
    color: colors.inkMuted,
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 10,
    letterSpacing: 1,
    paddingVertical: spacing.md,
    textAlign: "center",
    textTransform: "uppercase"
  },
  calendarGrid: {
    backgroundColor: "rgba(196,169,160,0.16)",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1
  },
  dayCell: {
    backgroundColor: colors.warm,
    minHeight: 58,
    padding: spacing.sm,
    width: "14.08%"
  },
  otherMonth: {
    backgroundColor: "rgba(254,252,249,0.55)"
  },
  today: {
    backgroundColor: "rgba(193,123,92,0.1)"
  },
  dayNum: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 12
  },
  otherMonthText: {
    color: "rgba(44,36,32,0.25)"
  },
  dotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    marginTop: spacing.xs
  },
  dot: {
    borderRadius: 3,
    height: 6,
    width: 6
  },
  memoryDot: {
    backgroundColor: colors.sageDark
  },
  milestoneDot: {
    backgroundColor: colors.sienna
  },
  apptDot: {
    backgroundColor: colors.gold
  },
  legend: {
    backgroundColor: colors.warm,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.md
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  legendDot: {
    borderRadius: 4,
    height: 8,
    width: 8
  },
  legendText: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 10
  },
  upcomingEvent: {
    alignItems: "center",
    borderBottomColor: "rgba(196,169,160,0.16)",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.lg
  },
  datePill: {
    alignItems: "center",
    width: 42
  },
  dateDay: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 23
  },
  dateMonth: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  timelineDot: {
    borderRadius: 5,
    height: 10,
    width: 10
  },
  upcomingTitle: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "600"
  },
  upcomingSub: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 11,
    marginTop: 2
  },
  journalEntry: {
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.22)",
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    position: "relative"
  },
  tapeSmall: {
    alignSelf: "center",
    backgroundColor: "rgba(201,169,110,0.3)",
    height: 14,
    position: "absolute",
    top: -6,
    width: 46
  },
  mood: {
    fontSize: 22,
    position: "absolute",
    right: spacing.lg,
    top: spacing.lg
  },
  journalDate: {
    color: colors.sienna,
    fontFamily: fonts.sans,
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    textTransform: "uppercase"
  },
  journalPhoto: {
    alignItems: "center",
    borderRadius: 4,
    height: 120,
    justifyContent: "center",
    marginBottom: spacing.md
  },
  journalText: {
    color: colors.inkLight,
    fontFamily: fonts.serif,
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 25
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  tag: {
    backgroundColor: colors.cream,
    borderRadius: 16,
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  addJournal: {
    alignItems: "center",
    borderColor: "rgba(196,169,160,0.42)",
    borderRadius: 4,
    borderStyle: "dashed",
    borderWidth: 1.5,
    padding: spacing.xxl
  },
  addJournalIcon: {
    fontSize: 26
  },
  addJournalText: {
    color: colors.inkMuted,
    fontFamily: fonts.serif,
    fontSize: 17,
    fontStyle: "italic",
    marginTop: spacing.xs
  },
  milestoneScreen: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    padding: spacing.xxl
  },
  glowOne: {
    backgroundColor: "rgba(193,123,92,0.18)",
    borderRadius: 200,
    height: 360,
    left: -90,
    position: "absolute",
    top: -80,
    width: 360
  },
  glowTwo: {
    backgroundColor: "rgba(181,196,177,0.14)",
    borderRadius: 150,
    bottom: -60,
    height: 260,
    position: "absolute",
    right: -50,
    width: 260
  },
  milestoneBadge: {
    backgroundColor: colors.sienna,
    color: colors.white,
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    textTransform: "uppercase"
  },
  bigEmoji: {
    fontSize: 76,
    marginBottom: spacing.xl
  },
  milestoneTitle: {
    color: colors.cream,
    fontFamily: fonts.serif,
    fontSize: 43,
    fontWeight: "300",
    lineHeight: 46,
    textAlign: "center"
  },
  milestoneDate: {
    color: "rgba(251,247,242,0.42)",
    fontFamily: fonts.sans,
    fontSize: 12,
    letterSpacing: 0.8,
    marginTop: spacing.md,
    textAlign: "center"
  },
  milestonePara: {
    color: "rgba(251,247,242,0.68)",
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 26,
    marginVertical: spacing.xxxl,
    textAlign: "center"
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 4,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.lg,
    width: "100%"
  },
  secondaryText: {
    color: "rgba(251,247,242,0.78)",
    fontFamily: fonts.sans,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  shareRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl
  },
  shareIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  currentPlan: {
    backgroundColor: colors.ink,
    margin: spacing.xl,
    padding: spacing.xxl
  },
  currentBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.gold,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textTransform: "uppercase"
  },
  currentName: {
    color: colors.cream,
    fontFamily: fonts.serif,
    fontSize: 30,
    fontWeight: "300"
  },
  currentPrice: {
    color: "rgba(251,247,242,0.45)",
    fontFamily: fonts.sans,
    fontSize: 13,
    marginBottom: spacing.md
  },
  darkFeature: {
    color: "rgba(251,247,242,0.68)",
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 22
  },
  planCard: {
    backgroundColor: colors.warm,
    borderColor: "rgba(196,169,160,0.28)",
    borderRadius: 4,
    borderWidth: 1.5,
    marginBottom: spacing.lg,
    padding: spacing.xl
  },
  recommended: {
    borderColor: colors.sienna
  },
  recommendedBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.sienna,
    color: colors.white,
    fontFamily: fonts.sans,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textTransform: "uppercase"
  },
  planTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  planName: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 24
  },
  planPrice: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 31,
    textAlign: "right"
  },
  planPeriod: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 10
  },
  planFeature: {
    color: colors.inkLight,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 22
  },
  planButton: {
    alignItems: "center",
    borderColor: "rgba(196,169,160,0.45)",
    borderRadius: 4,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md
  },
  planButtonFilled: {
    backgroundColor: colors.sienna,
    borderColor: colors.sienna
  },
  planButtonText: {
    color: colors.inkLight,
    fontFamily: fonts.sans,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  planButtonTextFilled: {
    color: colors.white
  },
  securityCard: {
    alignItems: "center",
    backgroundColor: colors.warm,
    borderColor: "rgba(181,196,177,0.38)",
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg
  },
  securityTitle: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "700"
  },
  securityText: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs
  },
  planNote: {
    backgroundColor: "rgba(181,196,177,0.12)",
    borderLeftColor: colors.sageDark,
    borderLeftWidth: 2,
    padding: spacing.lg
  },
  planNoteText: {
    color: colors.inkLight,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 20
  },
  bottomNav: {
    alignItems: "center",
    backgroundColor: "rgba(254,252,249,0.97)",
    borderTopColor: "rgba(196,169,160,0.22)",
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    left: 0,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    position: "absolute",
    right: 0
  },
  navItem: {
    alignItems: "center",
    gap: spacing.xs,
    minWidth: 62,
    padding: spacing.xs
  },
  navIcon: {
    fontSize: 20
  },
  navIconActive: {
    transform: [{ scale: 1.08 }]
  },
  navLabel: {
    color: colors.inkMuted,
    fontFamily: fonts.sans,
    fontSize: 8,
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  navLabelActive: {
    color: colors.sienna
  }
});
