import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import "../global.css";

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      const inAuthGroup = segments[0] === 'auth';

      if (!token && !inAuthGroup) {
        router.replace('/auth/login');
      } else if (token && inAuthGroup) {
        router.replace('/(tabs)');
      }
    };
    checkAuth();
  }, [segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />

      <Stack.Screen name="venues/index" options={{ title: 'Sale Weselne' }} />
      <Stack.Screen name="venues/[id]" options={{ title: 'Szczegóły Sali' }} />
      
      <Stack.Screen name="photographer/index" options={{ title: 'Fotografowie' }} />
      <Stack.Screen name="photographer/[id]" options={{ title: 'Szczegóły Fotografa' }} />

      <Stack.Screen name="music/index" options={{ title: 'Oprawa Muzyczna' }} />
      <Stack.Screen name="music/[id]" options={{ title: 'Szczegóły Muzyki' }} />

      <Stack.Screen name="florist/index" options={{ title: 'Florystyka' }} />
      <Stack.Screen name="florist/[id]" options={{ title: 'Szczegóły Florysty' }} />

      <Stack.Screen name="transport/index" options={{ title: 'Transport' }} />
      <Stack.Screen name="transport/[id]" options={{ title: 'Szczegóły Transportu' }} />

    </Stack>
  );
}