import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BrandMark, Button } from '@/components';
import { colors } from '@/theme';

interface Slide {
  headline: string;
  emphasis: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    headline: 'The most important year of your life',
    emphasis: 'deserves better than a messy camera roll.',
    body: 'The feeds, the firsts, the 3am thoughts you swear you’ll remember — Flourish keeps them all, gently, in one private place.',
  },
  {
    headline: '200 firsts are coming.',
    emphasis: 'Flourish will tell you before each one.',
    body: 'A quiet nudge before the first smile, the first giggle, the first steps — so your camera is ready, and you never have to say “I wish I’d caught that.”',
  },
  {
    headline: 'Zero ads. Zero AI training.',
    emphasis: 'Your baby’s story is yours alone.',
    body: 'Private by default. Shared only with the people you choose. We never sell, mine, or train on a single moment you keep here.',
  },
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const advance = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      router.push('/(auth)/sign-up');
    }
  };

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={['rgba(193,123,92,0.18)', 'transparent']}
        start={{ x: 0.85, y: 0.1 }}
        end={{ x: 0.2, y: 0.8 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.brandRow, { paddingTop: insets.top + 24 }]}>
        <BrandMark size={30} color={colors.sage} bloom />
        <AppText variant="display" color={colors.cream} style={styles.logo}>
          flour<AppText variant="displayItalic" color={colors.rose} style={styles.logo}>ish</AppText>
        </AppText>
        <AppText variant="serifItalic" color={colors.onDark40} style={styles.tagline}>
          Every first, forever.
        </AppText>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.slides}
      >
        {SLIDES.map((slide) => (
          <View key={slide.headline} style={[styles.slide, { width }]}>
            <AppText variant="display" color={colors.cream} style={styles.headline}>
              {slide.headline}{'\n'}
              <AppText variant="displayItalic" color={colors.rose} style={styles.headline}>
                {slide.emphasis}
              </AppText>
            </AppText>
            <AppText variant="bodyLight" color={colors.onDark60} style={styles.body}>
              {slide.body}
            </AppText>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index ? styles.dotOn : styles.dotOff]} />
          ))}
        </View>

        <Button label="Create your baby’s story" onPress={() => router.push('/(auth)/sign-up')} />

        <Pressable hitSlop={8} onPress={advance} style={styles.secondary}>
          <AppText variant="bodyMedium" color={colors.rose}>
            {index < SLIDES.length - 1 ? 'Continue  →' : 'Get started  →'}
          </AppText>
        </Pressable>

        <AppText variant="caption" color={colors.onDark25} center style={styles.micro}>
          Free forever at Seedling · No credit card needed
        </AppText>

        <Pressable hitSlop={8} onPress={() => router.push('/(auth)/sign-in')}>
          <AppText variant="caption" color={colors.onDark40} center style={styles.signIn}>
            I already have an account
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ink },
  brandRow: { alignItems: 'center', paddingBottom: 8 },
  logo: { fontSize: 30, marginTop: 10 },
  tagline: { fontSize: 13, marginTop: 2 },
  slides: { flex: 1 },
  slide: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  headline: { fontSize: 32, lineHeight: 36 },
  body: { marginTop: 16, fontSize: 15, lineHeight: 24 },
  footer: { paddingHorizontal: 28, gap: 4 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 20 },
  dot: { height: 4, borderRadius: 2 },
  dotOn: { width: 16, backgroundColor: colors.sienna },
  dotOff: { width: 5, backgroundColor: 'rgba(255,255,255,0.15)' },
  secondary: { alignItems: 'center', paddingVertical: 12 },
  micro: { marginTop: 2 },
  signIn: { marginTop: 14, textDecorationLine: 'underline' },
});
