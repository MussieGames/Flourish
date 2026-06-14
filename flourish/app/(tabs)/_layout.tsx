import { Tabs } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(254,252,249,0.97)',
          borderTopColor: 'rgba(196,169,160,0.2)',
          borderTopWidth: 1,
          paddingTop: 8,
          height: 72,
        },
        tabBarActiveTintColor: Colors.sienna,
        tabBarInactiveTintColor: Colors.inkMedium,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 8,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ focused }) => null, tabBarLabel: '🏠  Home' }}
      />
      <Tabs.Screen
        name="capture"
        options={{ title: 'Capture', tabBarLabel: '📸  Capture' }}
      />
      <Tabs.Screen
        name="scrapbook"
        options={{ title: 'Scrapbook', tabBarLabel: '📖  Scrapbook' }}
      />
      <Tabs.Screen
        name="firsts"
        options={{ title: 'Firsts', tabBarLabel: '⭐  Firsts' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarLabel: '👤  Profile' }}
      />
    </Tabs>
  );
}
