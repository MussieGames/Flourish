import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, type ColorValue } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(active: IconName, inactive: IconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} color={color as string} size={size} />
  );
}

export default function TabsLayout() {
  const { isOwner } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.sienna,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarIcon: tabIcon('camera', 'camera-outline'),
          href: isOwner ? undefined : null,
        }}
      />
      <Tabs.Screen name="scrapbook" options={{ title: 'Scrapbook', tabBarIcon: tabIcon('book', 'book-outline') }} />
      <Tabs.Screen name="firsts" options={{ title: 'Firsts', tabBarIcon: tabIcon('star', 'star-outline') }} />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: tabIcon('create', 'create-outline'),
          href: isOwner ? undefined : null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.warm,
    borderTopColor: 'rgba(196,169,160,0.25)',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
  },
  tabItem: { paddingVertical: 2 },
  tabLabel: { fontFamily: fonts.bodyMedium, fontSize: 8, letterSpacing: 0.6, textTransform: 'uppercase' },
});
