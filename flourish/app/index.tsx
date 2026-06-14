/**
 * Entry point — resolves auth state and redirects accordingly.
 * This screen is never visibly rendered; it acts as a router guard.
 */
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../src/constants/theme';

export default function Index() {
  const { initialized, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      router.replace('/(tabs)/');
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [initialized, isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.sienna} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
